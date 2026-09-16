import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2, Phone, ShieldCheck } from "lucide-react";

import { site } from "@/config/site";
import { optionKey, tintLanding, type LandingVariant } from "@/content/landing";
import {
  captureAttribution,
  isValidEmail,
  isValidPhone,
  isValidYear,
  submitLead,
} from "@/lib/leads";
import {
  trackLeadCaptured,
  trackPhoneClick,
  trackQuoteAdsConversion,
  trackQuoteComplete,
  trackQuoteError,
  trackQuoteStart,
} from "@/lib/analytics";
import { money, usePricing } from "@/lib/pricing";

/**
 * The paid-traffic lead form, shared by /tint and /ppf.
 *
 * This is deliberately NOT the five-step /quote flow. That flow is right for
 * someone who arrived via search and is already reading about film; a visitor
 * who tapped an ad mid-scroll will not sit through five screens. Everything
 * here is on one card, in one scroll, with one button.
 *
 * What it asks for and why:
 *   • Name + mobile — the only things the ShopFlow API actually requires, and
 *     the only things Angelo needs to text a price back.
 *   • Year / make / model / colour — required by the shop's own lead settings
 *     (customFields, all four flagged required). A lead without them is
 *     rejected server-side, so they can't be trimmed away for conversion's
 *     sake; they're laid out as one compact row instead.
 *   • One qualifying choice (film tier / coverage) and one concern — optional
 *     chips, pre-answered with "not sure", so a visitor can submit without
 *     touching them but a decisive one qualifies themselves.
 *   • Email — optional. The server doesn't need it and every extra required
 *     field on paid traffic costs leads.
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
  honeypot: "",
});

type Errors = Partial<
  Record<"name" | "phone" | "email" | "year" | "make" | "model" | "color", string>
>;

export function LandingLeadForm({
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
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startedRef = useRef(false);
  const leadSentFor = useRef<string | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

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

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackQuoteStart(variant.leadValue);
    }
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (k in e ? { ...e, [k]: undefined } : e));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = "Please enter your name";
    if (!isValidPhone(data.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (data.email.trim() && !isValidEmail(data.email)) e.email = "That email doesn't look right";
    if (!isValidYear(data.year)) e.year = "4-digit year";
    if (data.make.trim().length < 2) e.make = "Required";
    if (data.model.trim().length < 1) e.model = "Required";
    if (data.color.trim().length < 1) e.color = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending) return;
    if (!validate()) return;

    setSending(true);
    setSubmitError(null);

    // Conversions fire the moment we have a valid lead, once per phone number,
    // rather than on the success screen — a visitor who closes the tab while
    // the request is in flight is still a lead in ShopFlow.
    if (leadSentFor.current !== data.phone) {
      leadSentFor.current = data.phone;
      // Tier + vehicle ride along so ad platforms can optimise toward the
      // leads that are actually worth the most (ceramic, larger vehicles).
      trackLeadCaptured(variant.leadValue, {
        [variant.choice.param]: data.choice,
        vehicle_year: data.year,
        vehicle_make: data.make,
        vehicle_model: data.model,
      });
      trackQuoteAdsConversion();
    }

    const res = await submitLead({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: variant.service,
      serviceTag: variant.leadValue,
      goal: data.concern,
      timeline: "",
      notes: "",
      extraLines: [`${variant.choice.noteLabel}: ${data.choice}`, variant.sourceLine],
      vehicle: {
        year: data.year,
        make: data.make,
        model: data.model,
        color: data.color,
        type: "",
      },
      honeypot: data.honeypot,
    });

    setSending(false);
    if (res.ok) {
      setSubmitted(true);
      trackQuoteComplete(variant.leadValue);
      requestAnimationFrame(() => successRef.current?.focus());
    } else {
      trackQuoteError(res.error || "unknown");
      setSubmitError(
        res.error === "network"
          ? "We couldn't reach our system just then. Try again in a moment — or call and we'll take care of it right away."
          : res.error || "Something went wrong sending that. Please try again, or give us a call.",
      );
    }
  };

  /* ------------------------------------------------------------ success -- */
  if (submitted) {
    // The CTA promised a price, so the success screen shows one — a live
    // range from ShopFlow for what was chosen, clearly an estimate until the
    // shop confirms the flat number by text. No data → no estimate block; the
    // callback promise stands on its own, and a missing estimate is fine
    // where a wrong one is not.
    const vehicle = { year: data.year, make: data.make, model: data.model };
    const est = variant.estimate(pricing, data.choice);

    return (
      <div
        id={id}
        ref={successRef}
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
            Got it, {data.name.trim().split(" ")[0]}.
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
            {variant.successNote(data.choice, vehicle)}
          </p>
          <a href={shopPhone.href} className="btn btn-primary btn-lg mt-6" data-cta="success-call">
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

  /* --------------------------------------------------------------- form -- */
  const choiceChips = (
    <Chips
      key="choice"
      legend={variant.choice.legend}
      hint={variant.choice.hint}
      name={fid("choice")}
      options={variant.choice.options}
      value={data.choice}
      onChange={(v) => set("choice", v)}
    />
  );
  const concernChips = (
    <Chips
      key="concern"
      legend={variant.concern.legend}
      name={fid("concern")}
      options={variant.concern.options}
      value={data.concern}
      onChange={(v) => set("concern", v)}
    />
  );
  const chips = variant.choiceFirst ? [choiceChips, concernChips] : [concernChips, choiceChips];

  return (
    <form id={id} onSubmit={submit} noValidate className="panel scroll-mt-24 p-5 sm:p-7">
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
        {chips}

        <fieldset>
          <legend className="mb-3 font-display text-[0.9375rem] font-semibold">Your vehicle</legend>
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
              label="Color"
              value={data.color}
              onChange={(v) => set("color", v)}
              error={errors.color}
              placeholder="Blue"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-[0.9375rem] font-semibold">
            Where do we send it?
          </legend>
          <div className="grid gap-3">
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

      {submitError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p>{submitError}</p>
            <a
              href={shopPhone.href}
              className="mt-2 inline-flex items-center gap-1.5 font-medium text-accent"
            >
              <Phone className="h-3.5 w-3.5" />
              {shopPhone.display}
            </a>
          </div>
        </div>
      )}

      {/* Submit, then click-to-call directly under it. A visitor who has got
          this far and would rather talk gets the number right here, not back
          up in the header — on mobile the call is the higher-intent action.
          Stacked at every width: the form column is narrow on desktop too. */}
      <div className="mt-7 flex flex-col gap-3">
        <button type="submit" disabled={sending} className="btn btn-primary btn-lg w-full">
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
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
