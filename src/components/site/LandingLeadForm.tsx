import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2, Phone, ShieldCheck } from "lucide-react";

import { site } from "@/config/site";
import { serviceBySlug } from "@/content/services";
import {
  captureAttribution,
  isValidEmail,
  isValidPhone,
  isValidYear,
  submitLead,
} from "@/lib/leads";
import {
  trackLeadCaptured,
  trackQuoteAdsConversion,
  trackQuoteComplete,
  trackQuoteError,
  trackQuoteStart,
} from "@/lib/analytics";

/**
 * The paid-social lead form.
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
 *   • Film tier and goal — optional chips, pre-answered with "not sure", so a
 *     visitor can submit without touching them but a decisive one qualifies
 *     themselves.
 *   • Email — optional. The server doesn't need it and every extra required
 *     field on paid traffic costs leads.
 *
 * Copy rule inherited from the rest of the site: no prices here (they live in
 * ShopFlow, see lib/pricing.ts). The performance figures and the warranty are
 * the owner-supplied ones in `site.tintSpecs` — this form renders them, it
 * doesn't invent them.
 */

const TINT = serviceBySlug("window-tint");

/** Matches the shop's ShopFlow lead-form option list character for character. */
const LEAD_VALUE = TINT?.leadValue ?? "Window tint";

const specs = site.tintSpecs;

/** The tier chips carry the numbers, so choosing one is itself the pitch. */
const TIERS = [
  `Ceramic — ${specs.ceramic.heat}% heat`,
  `Carbon — ${specs.carbon.heat}% heat`,
  "Not sure — recommend one",
] as const;

/** Trimmed from the tint page's goal list — four reads faster than six. */
const GOALS = [
  "Heat — the car bakes",
  "Glare on my commute",
  "Privacy / security",
  "Looks",
  "Removing old tint",
] as const;

type Data = {
  name: string;
  phone: string;
  email: string;
  year: string;
  make: string;
  model: string;
  color: string;
  tier: string;
  goal: string;
  honeypot: string;
};

const initial: Data = {
  name: "",
  phone: "",
  email: "",
  year: "",
  make: "",
  model: "",
  color: "",
  tier: "Not sure — recommend one",
  goal: "",
  honeypot: "",
};

type Errors = Partial<
  Record<"name" | "phone" | "email" | "year" | "make" | "model" | "color", string>
>;

export function LandingLeadForm({ id = "quote" }: { id?: string }) {
  // The page renders this form twice (hero + close). Element ids are scoped to
  // the instance so labels, aria-describedby and the honeypot stay unique —
  // duplicate ids silently break label-click and screen-reader association.
  const fid = (suffix: string) => `${id}-${suffix}`;
  const [data, setData] = useState<Data>(initial);
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

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackQuoteStart(LEAD_VALUE);
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
      trackLeadCaptured(LEAD_VALUE);
      trackQuoteAdsConversion();
    }

    const res = await submitLead({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: "Window Tint",
      serviceTag: LEAD_VALUE,
      goal: data.goal,
      timeline: "",
      notes: "",
      extraLines: [`Film tier: ${data.tier}`, "Source: tint landing page (paid social)"],
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
      trackQuoteComplete(LEAD_VALUE);
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
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            We'll come back with a shade recommendation and a flat price for your {data.year}{" "}
            {data.make} {data.model} — usually the same day during shop hours.
          </p>
          <a
            href={site.business.phoneHref}
            className="btn btn-primary btn-lg mt-7"
            data-cta="success-call"
          >
            <Phone className="h-4 w-4" />
            Or call {site.business.phone}
          </a>
          <p className="mt-5 text-sm text-muted-foreground">
            {site.business.address.split(",")[0]} · Mon–Sat 10–6 · Walk-ins welcome
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- form -- */
  return (
    <form id={id} onSubmit={submit} noValidate className="panel scroll-mt-24 p-5 sm:p-7">
      <h2 className="font-display text-[clamp(1.35rem,2.6vw,1.75rem)]">Get your tint price</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Tell us the car and what's bothering you. We'll text back a shade recommendation and a flat
        number — no deposit, no obligation.
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          {specs.warranty}
        </span>
        <span>{specs.ceramic.uv}% UV blocked</span>
        <span>Up to {specs.ceramic.heat}% heat rejected</span>
      </p>

      <div className="mt-6 space-y-6">
        <Chips
          legend="What's bothering you?"
          name={fid("goal")}
          options={GOALS}
          value={data.goal}
          onChange={(v) => set("goal", v)}
        />

        <Chips
          legend="Film"
          hint={`Both block ${specs.ceramic.uv}% of UV and never purple. The difference is heat — ${specs.carbon.heat}% vs ${specs.ceramic.heat}%.`}
          name={fid("tier")}
          options={TIERS}
          value={data.tier}
          onChange={(v) => set("tier", v)}
        />

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
              hint="We'll text your price here."
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
              href={site.business.phoneHref}
              className="mt-2 inline-flex items-center gap-1.5 font-medium text-accent"
            >
              <Phone className="h-3.5 w-3.5" />
              {site.business.phone}
            </a>
          </div>
        </div>
      )}

      <button type="submit" disabled={sending} className="btn btn-primary btn-lg mt-7 w-full">
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Get My Tint Price
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

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
