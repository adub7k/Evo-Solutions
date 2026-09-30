import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { site } from "@/config/site";
import { carName, optionKey, tintLanding, type LandingVariant } from "@/content/landing";
import {
  captureAttribution,
  isValidEmail,
  isValidPhone,
  isValidYear,
  submitLead,
  uploadPhotos,
} from "@/lib/leads";
import {
  trackLeadCaptured,
  trackPhoneClick,
  trackQuoteAdsConversion,
  trackQuoteComplete,
  trackQuoteError,
  trackQuoteStart,
  trackQuoteStep,
} from "@/lib/analytics";
import { money, usePricing } from "@/lib/pricing";

/**
 * The paid-traffic lead form, shared by /tint, /ppf and /ceramic.
 *
 * This is deliberately NOT the five-step /quote flow. That flow is right for
 * someone who arrived via search and is already reading about film; a visitor
 * who tapped an ad mid-scroll will not sit through five screens.
 *
 * Two short steps, contact first:
 *   1. One qualifying chip + name + mobile. That is everything Angelo needs to
 *      text a price back, so the lead is POSTED the moment it validates and
 *      the ad conversions fire then. A visitor who bails on step 2 is still a
 *      lead in ShopFlow, not a lost session.
 *   2. Vehicle, one "what's bothering you" chip, optional email (and photos on
 *      /ceramic). Posted again on submit — ShopFlow dedupes by phone and
 *      merges, and alerts the owner once. Skippable: "just text me" goes
 *      straight to the success screen, because the lead already exists.
 *
 * Step 1 posts with skipRequiredCustomFields (the vehicle hasn't been asked
 * yet); step 2 posts without it, so a completed form still meets the shop's
 * year/make/model rule. Colour is optional — the server never requires it.
 *
 * Everything that differs per page — copy, chips, the success-screen estimate
 * — is a `LandingVariant` from content/landing.ts. Copy rule inherited from
 * the rest of the site: no prices typed here (they live in ShopFlow, see
 * lib/pricing.ts) and no claim that isn't in `site.*Specs` with a source.
 */

type Data = {
  name: string;
  phone: string;
  email: string;
  year: string;
  make: string;
  model: string;
  color: string;
  choice: string;
  concern: string;
  photos: File[];
  honeypot: string;
};

const initialFor = (v: LandingVariant): Data => ({
  name: "",
  phone: "",
  email: "",
  year: "",
  make: "",
  model: "",
  color: "",
  choice: v.choice.initial,
  concern: "",
  photos: [],
  honeypot: "",
});

type Errors = Partial<Record<"name" | "phone" | "email" | "year" | "make" | "model", string>>;

type Stage = "contact" | "details" | "done";

type FormProps = Parameters<typeof FormStages>[0];

/**
 * The anchor (#quote / #quote-close) lives on a wrapper that never unmounts.
 * The card inside swaps element three times (contact → details → done), and
 * anything holding a reference to the old node — the sticky bar's
 * IntersectionObserver, an in-page anchor — would otherwise lose it.
 */
export function LandingLeadForm(props: FormProps) {
  const id = props.id ?? "quote";
  return (
    <div id={id} className="scroll-mt-24">
      <FormStages {...props} id={id} />
    </div>
  );
}

function FormStages({
  id = "quote",
  variant = tintLanding,
  preset = null,
  presetKey = 0,
  phone,
}: {
  id?: string;
  variant?: LandingVariant;
  /**
   * Preselects a choice chip by key prefix — "ceramic" (/tint#ceramic ad
   * traffic), "full-front" (/ppf#full-front, or the coverage cards on /ppf).
   */
  preset?: string | null;
  /** Bump to re-apply the same preset (a card tapped twice). */
  presetKey?: number;
  /** Channel-specific display number; defaults to the shop's own. */
  phone?: { display: string; href: string };
}) {
  // The page renders this form twice (hero + close). Element ids are scoped to
  // the instance so labels, aria-describedby and the honeypot stay unique —
  // duplicate ids silently break label-click and screen-reader association.
  const fid = (suffix: string) => `${id}-${suffix}`;
  const shopPhone = phone ?? { display: site.business.phone, href: site.business.phoneHref };
  const pricing = usePricing();
  const [data, setData] = useState<Data>(() => initialFor(variant));
  const [errors, setErrors] = useState<Errors>({});
  const [stage, setStage] = useState<Stage>("contact");
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startedRef = useRef(false);
  const leadSentFor = useRef<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // First-touch ad attribution (utm_*, fbclid, gclid) is stashed on mount so a
  // visitor who scrolls the whole page before filling anything in still gets
  // credited to the ad they clicked.
  useEffect(() => {
    captureAttribution();
  }, []);

  // Ad-driven preselect (#ceramic). Applied via setData, not set(), so it
  // neither fires quote_start nor overrides a choice the visitor already made.
  // A preset is an explicit choice — from the arrival hash or a coverage card
  // — so it applies whenever it changes, even after the visitor has typed.
  useEffect(() => {
    if (!preset) return;
    const chip = variant.choice.options.find((o) => optionKey(o).startsWith(preset));
    if (chip) setData((d) => ({ ...d, choice: chip }));
  }, [preset, presetKey, variant]);

  // Each stage change moves focus to the new card's heading, so keyboard and
  // screen-reader users land on the thing that just appeared.
  useEffect(() => {
    if (stage !== "contact") requestAnimationFrame(() => stageRef.current?.focus());
  }, [stage]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackQuoteStart(variant.leadValue);
    }
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (k in e ? { ...e, [k]: undefined } : e));
  };

  const baseLead = () => ({
    name: data.name,
    phone: data.phone,
    service: variant.service,
    serviceTag: variant.leadValue,
    timeline: "",
    notes: "",
    honeypot: data.honeypot,
  });

  /* ------------------------------------------------------ step 1: contact -- */
  const submitContact = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending) return;
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = "Please enter your name";
    if (!isValidPhone(data.phone)) e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    setSubmitError(null);

    // Conversions fire the moment we have a valid lead, once per phone number
    // — a visitor who closes the tab while the request is in flight is still
    // a lead in ShopFlow.
    if (leadSentFor.current !== data.phone) {
      leadSentFor.current = data.phone;
      trackLeadCaptured(variant.leadValue, { [variant.choice.param]: data.choice });
      trackQuoteAdsConversion();
    }

    const res = await submitLead({
      ...baseLead(),
      email: "",
      goal: "",
      extraLines: [`${variant.choice.noteLabel}: ${data.choice}`, variant.sourceLine],
      vehicle: { year: "", make: "", model: "", color: "", type: "" },
      // The vehicle is step 2's question. Name + phone are still enforced.
      skipRequiredCustomFields: true,
    });

    setSending(false);
    if (res.ok) {
      trackQuoteStep(1, "Contact", variant.leadValue);
      setStage("details");
    } else {
      trackQuoteError(res.error || "unknown");
      setSubmitError(
        res.error === "network"
          ? "We couldn't reach our system just then. Try again in a moment — or call and we'll take care of it right away."
          : res.error || "Something went wrong sending that. Please try again, or give us a call.",
      );
    }
  };

  /* ------------------------------------------------------ step 2: details -- */
  const submitDetails = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending) return;
    const e: Errors = {};
    if (!isValidYear(data.year)) e.year = "4-digit year";
    if (data.make.trim().length < 2) e.make = "Required";
    if (data.model.trim().length < 1) e.model = "Required";
    if (data.email.trim() && !isValidEmail(data.email)) e.email = "That email doesn't look right";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    setSubmitError(null);

    // Photos are best-effort: a failed upload never blocks the lead.
    const photoUrls = data.photos.length ? await uploadPhotos(data.photos) : [];

    // Tier + vehicle ride along so ad platforms can optimise toward the leads
    // that are actually worth the most (ceramic, larger vehicles). Not a
    // second conversion — generate_lead already fired on step 1.
    trackQuoteStep(2, "Vehicle", variant.leadValue);

    const res = await submitLead({
      ...baseLead(),
      email: data.email,
      goal: data.concern,
      extraLines: [`${variant.choice.noteLabel}: ${data.choice}`, variant.sourceLine],
      vehicle: {
        year: data.year,
        make: data.make,
        model: data.model,
        color: data.color,
        type: "",
      },
      photoUrls,
    });

    setSending(false);
    if (res.ok) {
      finish();
    } else {
      trackQuoteError(res.error || "unknown");
      setSubmitError(
        "That didn't go through — but we already have your number, so you'll still hear from us. Try again, or skip and we'll ask by text.",
      );
    }
  };

  const finish = () => {
    trackQuoteComplete(variant.leadValue);
    setStage("done");
  };

  const firstName = data.name.trim().split(" ")[0];
  const hasVehicle = !!(data.year && data.make && data.model);

  /* ------------------------------------------------------------ success -- */
  if (stage === "done") {
    // The CTA promised a price, so the success screen shows one — a live
    // range from ShopFlow for what was chosen, clearly an estimate until the
    // shop confirms the flat number by text. No data → no estimate block; the
    // callback promise stands on its own, and a missing estimate is fine
    // where a wrong one is not.
    const vehicle = { year: data.year, make: data.make, model: data.model };
    const est = variant.estimate(pricing, data.choice);

    return (
      <div
        ref={stageRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        data-quote-state="success"
        className="panel p-6 outline-none sm:p-8"
      >
        <div className="py-4 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
            <Check className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
          </div>
          <h2 className="mt-6 font-display text-[clamp(1.6rem,4vw,2.1rem)]">
            Got it, {firstName}.
          </h2>

          {est && (
            <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-surface-2 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{est.label}</p>
              <p className="mt-1.5 font-display text-3xl font-bold tracking-tight text-accent">
                {est.min === est.max ? money(est.min) : `${money(est.min)}–${money(est.max)}`}
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                {variant.estimateNote(data.choice, vehicle)}
              </p>
            </div>
          )}

          <p className="mx-auto mt-5 max-w-sm text-muted-foreground">
            {hasVehicle
              ? variant.successNote(data.choice, vehicle)
              : "We'll text you shortly to ask what you drive, then send your flat price — usually the same day during shop hours."}
          </p>
          <a
            href={shopPhone.href}
            onClick={() => trackPhoneClick("landing-success")}
            className="btn btn-primary btn-lg mt-6"
            data-cta="success-call"
          >
            <Phone className="h-4 w-4" />
            Call now to book — {shopPhone.display}
          </a>
          <p className="mt-5 text-sm text-muted-foreground">
            {site.business.address.split(",")[0]} · Mon–Sat 10–6 · Walk-ins welcome
          </p>
        </div>
      </div>
    );
  }

  const errorBox = submitError && (
    <div
      role="alert"
      className="mt-6 flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <div>
        <p>{submitError}</p>
        <a
          href={shopPhone.href}
          onClick={() => trackPhoneClick("landing-form-error")}
          className="mt-2 inline-flex items-center gap-1.5 font-medium text-accent"
        >
          <Phone className="h-3.5 w-3.5" />
          {shopPhone.display}
        </a>
      </div>
    </div>
  );

  const spinner = (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Sending…
    </>
  );

  /* ------------------------------------------------------- step 2 form -- */
  if (stage === "details") {
    return (
      <form onSubmit={submitDetails} noValidate className="panel p-5 sm:p-7">
        <div ref={stageRef} tabIndex={-1} className="outline-none">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Step 1 done — we have your number
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.35rem,2.6vw,1.75rem)]">
            {firstName}, what are we pricing?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {variant.details.intro}
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <fieldset>
            <legend className="mb-3 font-display text-[0.9375rem] font-semibold">
              Your vehicle
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Input
                idPrefix={id}
                label="Year"
                value={data.year}
                onChange={(v) => set("year", v)}
                error={errors.year}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="2021"
              />
              <Input
                idPrefix={id}
                label="Make"
                value={data.make}
                onChange={(v) => set("make", v)}
                error={errors.make}
                placeholder="Toyota"
              />
              <Input
                idPrefix={id}
                label="Model"
                value={data.model}
                onChange={(v) => set("model", v)}
                error={errors.model}
                placeholder="Camry"
              />
              <Input
                idPrefix={id}
                label="Color (optional)"
                value={data.color}
                onChange={(v) => set("color", v)}
                placeholder="Blue"
              />
            </div>
          </fieldset>

          <Chips
            legend={variant.concern.legend}
            name={fid("concern")}
            options={variant.concern.options}
            value={data.concern}
            onChange={(v) => set("concern", v)}
          />

          {variant.details.photos && (
            <PhotoPicker
              id={fid("photos")}
              hint={variant.details.photos}
              files={data.photos}
              onChange={(files) => set("photos", files)}
            />
          )}

          <Input
            idPrefix={id}
            label="Email (optional)"
            value={data.email}
            onChange={(v) => set("email", v)}
            error={errors.email}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
        </div>

        {errorBox}

        <div className="mt-7 flex flex-col gap-3">
          <button type="submit" disabled={sending} className="btn btn-primary btn-lg w-full">
            {sending ? (
              spinner
            ) : (
              <>
                {variant.details.cta}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => {
              trackQuoteStep(2, "Skipped vehicle", variant.leadValue);
              finish();
            }}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Skip — just text me
          </button>
        </div>
      </form>
    );
  }

  /* ------------------------------------------------------- step 1 form -- */
  return (
    <form onSubmit={submitContact} noValidate className="panel p-5 sm:p-7">
      <h2 className="font-display text-[clamp(1.35rem,2.6vw,1.75rem)]">{variant.form.heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{variant.form.intro}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        {variant.form.trust.map((t, i) =>
          i === 0 ? (
            <span key={t} className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              {t}
            </span>
          ) : (
            <span key={t}>{t}</span>
          ),
        )}
      </p>

      <div className="mt-6 space-y-6">
        <Chips
          legend={variant.choice.legend}
          hint={variant.choice.hint}
          name={fid("choice")}
          options={variant.choice.options}
          value={data.choice}
          onChange={(v) => set("choice", v)}
        />

        <fieldset>
          <legend className="mb-3 font-display text-[0.9375rem] font-semibold">
            Where do we send it?
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              idPrefix={id}
              label="Your name"
              value={data.name}
              onChange={(v) => set("name", v)}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              idPrefix={id}
              label="Mobile number"
              value={data.phone}
              onChange={(v) => set("phone", v)}
              error={errors.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              hint={variant.form.phoneHint}
            />
          </div>
        </fieldset>

        {/* Honeypot: bots fill it, humans never see it. */}
        <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor={fid("website-hp")}>Website</label>
          <input
            id={fid("website-hp")}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={data.honeypot}
            onChange={(e) => setData((d) => ({ ...d, honeypot: e.target.value }))}
          />
        </div>
      </div>

      {errorBox}

      {/* Submit, then click-to-call directly under it. A visitor who has got
          this far and would rather talk gets the number right here, not back
          up in the header — on mobile the call is the higher-intent action.
          Stacked at every width: the form column is narrow on desktop too. */}
      <div className="mt-7 flex flex-col gap-3">
        <button type="submit" disabled={sending} className="btn btn-primary btn-lg w-full">
          {sending ? (
            spinner
          ) : (
            <>
              {variant.form.cta}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <a
          href={shopPhone.href}
          onClick={() => trackPhoneClick("landing-form")}
          className="btn btn-ghost btn-lg w-full"
        >
          <Phone className="h-4 w-4" />
          Call {shopPhone.display}
        </a>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        Goes straight to the shop — a real person replies. We use your details to send this quote
        and follow up about it. No lists, no sharing, no spam.
      </p>
    </form>
  );
}

/* ============================================================ subparts == */

function Chips({
  legend,
  hint,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 font-display text-[0.9375rem] font-semibold">{legend}</legend>
      {hint && <p className="mb-3 text-xs text-muted-foreground">{hint}</p>}
      <div className={`flex flex-wrap gap-2 ${hint ? "" : "mt-3"}`}>
        {options.map((o) => {
          const active = o === value;
          return (
            <label
              key={o}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-line-strong text-foreground hover:bg-surface-2"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o}
                checked={active}
                onChange={() => onChange(o)}
                className="sr-only"
              />
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Input({
  idPrefix,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
}: {
  idPrefix: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = `${idPrefix}-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`w-full rounded-md border bg-background px-4 py-3 text-[0.9375rem] text-foreground placeholder:text-faint-foreground focus:outline-none ${
          error ? "border-destructive" : "border-border focus:border-accent"
        }`}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Optional photo attach (/ceramic). Coating quotes turn on paint condition,
 * so a couple of daylight photos save a round of texts. Up to 3, uploaded on
 * submit via lib/leads.uploadPhotos; a failed upload never blocks the lead.
 */
function PhotoPicker({
  id,
  hint,
  files,
  onChange,
}: {
  id: string;
  hint: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line-strong px-4 py-3.5 text-sm hover:bg-surface-2"
      >
        <Camera className="h-5 w-5 shrink-0 text-accent" />
        <span>
          <span className="font-semibold">
            {files.length
              ? `${files.length} photo${files.length > 1 ? "s" : ""} attached`
              : "Add photos (optional)"}
          </span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => onChange(Array.from(e.target.files ?? []).slice(0, 3))}
      />
    </div>
  );
}
