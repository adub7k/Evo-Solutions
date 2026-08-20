import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  Phone,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { site } from "@/config/site";
import type { CommercialLead } from "@/content/services";
import {
  captureAttribution,
  isValidEmail,
  isValidPhone,
  submitLead,
  uploadPhotos,
} from "@/lib/leads";
import { usePricing, money, type Pricing } from "@/lib/pricing";
import {
  trackLeadCaptured,
  trackQuoteAdsConversion,
  trackQuoteComplete,
  trackQuoteError,
  trackQuoteStart,
  trackQuoteStep,
} from "@/lib/analytics";

/**
 * Building-glass quoting.
 *
 * A vehicle quote needs three facts (year, make, model). A building quote needs
 * the things that actually drive a flat-glass job — how much glass, which
 * elevations cook, whether it's sealed double glazing, and how reachable it is.
 * Collecting those here means Angelo can price the job (or at least walk in
 * already knowing what he's looking at) instead of making a discovery call.
 *
 * The ballpark at the end is only shown when a per-square-foot rate exists in
 * ShopFlow (see `perSqFtRate`). We do not invent a number.
 */

const STEPS = ["Property", "Goals", "The glass", "Photos", "Contact"] as const;
const MAX_PHOTOS = 4;

const GLASS_TYPES = ["Single pane", "Double glazed", "Not sure"];
const ACCESS = ["All ground floor", "Upper floors too", "Not sure"];
const ELEVATIONS = ["South", "West", "East", "North", "Not sure"];

type Data = {
  propertyType: string;
  goals: string[];
  windows: string;
  sqft: string;
  elevations: string[];
  glassType: string;
  access: string;
  details: string;
  photos: File[];
  business: string;
  propertyAddress: string;
  name: string;
  phone: string;
  email: string;
  honeypot: string;
};

const initial: Data = {
  propertyType: "",
  goals: [],
  windows: "",
  sqft: "",
  elevations: [],
  glassType: "",
  access: "",
  details: "",
  photos: [],
  business: "",
  propertyAddress: "",
  name: "",
  phone: "",
  email: "",
  honeypot: "",
};

/**
 * Per-square-foot commercial rate, if Angelo has added one in ShopFlow.
 * He creates a service named e.g. "Commercial Window Film - per sq ft" and the
 * ballpark estimator switches itself on. Until then this returns null and the
 * form simply doesn't show an estimate. See VERIFY.md.
 */
function perSqFtRate(pricing: Pricing | null): number | null {
  const rows = Object.values(pricing?.rows ?? {}).flat();
  const match = rows.find((r) => /per\s*sq|sq\.?\s*ft|square\s*f(oo|ee)?t/i.test(r.name));
  if (!match) return null;
  const rate = match.flat ?? null;
  return rate && rate > 0 && rate < 100 ? rate : null; // sanity: a rate, not a job total
}

export function CommercialQuoteForm({ lead }: { lead: CommercialLead }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const headingRef = useRef<HTMLDivElement | null>(null);

  const pricing = usePricing();
  const rate = perSqFtRate(pricing);

  useEffect(() => {
    captureAttribution();
  }, []);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!started.current) {
      started.current = true;
      trackQuoteStart("Commercial & Home Window Tint");
    }
    setData((d) => ({ ...d, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const toggle = (k: "goals" | "elevations", v: string) =>
    set(k, data[k].includes(v) ? data[k].filter((x) => x !== v) : [...data[k], v]);

  const sqftNum = Number(data.sqft.replace(/[^\d.]/g, ""));
  const estimate = useMemo(() => {
    if (!rate || !Number.isFinite(sqftNum) || sqftNum <= 0) return null;
    // A deliberately wide band. This is an order-of-magnitude sanity check for
    // the customer, not a quote — the site visit produces the real number.
    return {
      low: Math.round((sqftNum * rate * 0.85) / 25) * 25,
      high: Math.round((sqftNum * rate * 1.25) / 25) * 25,
    };
  }, [rate, sqftNum]);

  const canAdvance = () => {
    if (step === 0) return !!data.propertyType;
    if (step === 1) return data.goals.length > 0;
    if (step === 2) return !!(data.windows || data.sqft);
    if (step === 3) return true;
    if (step === 4) return !!(data.name && data.phone && data.email);
    return true;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 4) {
      if (data.name.trim().length < 2) e.name = "Please enter your name";
      if (!isValidPhone(data.phone)) e.phone = "Enter a valid 10-digit phone number";
      if (!isValidEmail(data.email)) e.email = "Enter a valid email address";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goTo = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    if (!canAdvance() || !validate()) return;
    trackQuoteStep(step, STEPS[step], "Commercial & Home Window Tint");
    goTo(step + 1);
  };

  const submit = async () => {
    if (!canAdvance() || !validate() || sending) return;
    setSending(true);
    setError(null);
    trackLeadCaptured("Commercial & Home Window Tint");
    trackQuoteAdsConversion();

    const photoUrls = data.photos.length ? await uploadPhotos(data.photos, MAX_PHOTOS) : [];

    const res = await submitLead({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: "Commercial & Home Window Tint",
      serviceTag: "Window tint", // must match ShopFlow's lead-form options
      goal: data.goals.join(", "),
      timeline: "",
      notes: data.details,
      extraLines: [
        "— COMMERCIAL / HOME GLASS ENQUIRY —",
        data.business && `Business: ${data.business}`,
        `Property type: ${data.propertyType}`,
        data.propertyAddress && `Property address: ${data.propertyAddress}`,
        data.windows && `Approx windows: ${data.windows}`,
        data.sqft && `Approx glass area: ${data.sqft} sq ft`,
        data.elevations.length && `Sun-facing elevations: ${data.elevations.join(", ")}`,
        data.glassType && `Glass type: ${data.glassType}`,
        data.access && `Access: ${data.access}`,
        estimate && `Ballpark shown on site: ${money(estimate.low)}–${money(estimate.high)}`,
      ].filter(Boolean) as string[],
      vehicle: { year: "", make: "", model: "", type: "" },
      photoUrls,
      honeypot: data.honeypot,
    });

    setSending(false);
    if (res.ok) {
      setSent(true);
      trackQuoteComplete("Commercial & Home Window Tint");
    } else {
      trackQuoteError(res.error || "unknown");
      setError("We couldn't send that just then. Try again in a moment, or give the shop a call.");
    }
  };

  /* ------------------------------------------------------------ success -- */
  if (sent) {
    return (
      <div
        className="panel p-6 text-center sm:p-10"
        role="status"
        aria-live="polite"
        data-quote-state="success"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
          <Check className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
        </div>
        <h3 className="mt-6 font-display text-3xl">Thanks, {data.name.trim().split(" ")[0]}.</h3>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          We've got the details on {data.propertyType.toLowerCase()} glass
          {data.sqft ? ` (about ${data.sqft} sq ft)` : ""}. We'll call to book the on-site
          assessment and put a fixed number in writing after that.
        </p>
        <a
          href={site.business.phoneHref}
          className="tap-target mt-5 gap-2 text-accent underline underline-offset-4"
        >
          <Phone className="h-4 w-4" />
          {site.business.phone}
        </a>
      </div>
    );
  }

  const lastStep = step === STEPS.length - 1;

  return (
    <div className="panel p-5 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-semibold uppercase tracking-[0.14em] text-accent">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-muted-foreground">{STEPS[step]}</span>
        </div>
        <div
          className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Quote progress"
        >
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* keyed on step so each screen animates in; state lives above this
          node, so nothing the visitor has typed is lost between steps */}
      <div key={step} ref={headingRef} tabIndex={-1} className="step-enter outline-none">
        {step === 0 && (
          <Group label={lead.selectLabel}>
            <Chips
              options={lead.selectOptions}
              selected={data.propertyType ? [data.propertyType] : []}
              onPick={(v) => set("propertyType", v)}
            />
          </Group>
        )}

        {step === 1 && (
          <Group label="What's driving it?" hint="Pick everything that applies.">
            <Chips
              options={lead.goalOptions}
              selected={data.goals}
              onPick={(v) => toggle("goals", v)}
              multi
            />
          </Group>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <Group label="How much glass?" hint="A rough number is fine — we measure on site.">
              <div className="grid gap-3 sm:grid-cols-2">
                <Text
                  label="Approx. number of windows"
                  value={data.windows}
                  onChange={(v) => set("windows", v)}
                  inputMode="numeric"
                  placeholder="12"
                />
                <Text
                  label="Approx. total sq ft (optional)"
                  value={data.sqft}
                  onChange={(v) => set("sqft", v)}
                  inputMode="numeric"
                  placeholder="400"
                  hint="Width × height × number of panes."
                />
              </div>
            </Group>

            {estimate && (
              <div className="flex gap-3 rounded-md border border-accent/40 bg-accent-soft p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed">
                  <span className="font-display font-semibold">
                    Ballpark: {money(estimate.low)}–{money(estimate.high)}
                  </span>
                  <span className="block text-muted-foreground">
                    Based on {sqftNum.toLocaleString("en-US")} sq ft. Film choice, access and glass
                    type all move this — the on-site assessment gives you a fixed number.
                  </span>
                </p>
              </div>
            )}

            <Group label="Which sides get the sun?" hint="Where the heat and glare come from.">
              <Chips
                options={ELEVATIONS}
                selected={data.elevations}
                onPick={(v) => toggle("elevations", v)}
                multi
              />
            </Group>

            <Group label="Glass type">
              <Chips
                options={GLASS_TYPES}
                selected={data.glassType ? [data.glassType] : []}
                onPick={(v) => set("glassType", v)}
              />
              {data.glassType === "Double glazed" && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Worth knowing: not every film suits sealed double glazing — some combinations risk
                  thermal stress. We check this on site rather than guessing.
                </p>
              )}
            </Group>

            <Group label="Access">
              <Chips
                options={ACCESS}
                selected={data.access ? [data.access] : []}
                onPick={(v) => set("access", v)}
              />
            </Group>
          </div>
        )}

        {step === 3 && (
          <PhotoStep
            photos={data.photos}
            onChange={(p) => set("photos", p)}
            details={data.details}
            onDetails={(v) => set("details", v)}
          />
        )}

        {step === 4 && (
          <div className="space-y-7">
            <Group label="Where should we send the quote?">
              <div className="grid gap-3 sm:grid-cols-2">
                <Text
                  label="Business name (optional)"
                  value={data.business}
                  onChange={(v) => set("business", v)}
                />
                <Text
                  label="Your name"
                  value={data.name}
                  onChange={(v) => set("name", v)}
                  error={errors.name}
                  autoComplete="name"
                />
                <Text
                  label="Phone"
                  value={data.phone}
                  onChange={(v) => set("phone", v)}
                  error={errors.phone}
                  type="tel"
                  autoComplete="tel"
                />
                <Text
                  label="Email"
                  value={data.email}
                  onChange={(v) => set("email", v)}
                  error={errors.email}
                  type="email"
                  autoComplete="email"
                />
                <Text
                  label="Property address"
                  value={data.propertyAddress}
                  onChange={(v) => set("propertyAddress", v)}
                  className="sm:col-span-2"
                  hint="So we can plan the site visit. Optional, but it speeds things up."
                />
              </div>
            </Group>

            <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="c-website">Website</label>
              <input
                id="c-website"
                tabIndex={-1}
                autoComplete="off"
                value={data.honeypot}
                onChange={(e) => setData((d) => ({ ...d, honeypot: e.target.value }))}
              />
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              We use your details to arrange the assessment and follow up about it. Nothing else.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p>{error}</p>
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

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button onClick={() => goTo(step - 1)} className="btn btn-ghost" type="button">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span />
        )}

        {!lastStep ? (
          <button onClick={next} disabled={!canAdvance()} className="btn btn-primary" type="button">
            {step === 3 && data.photos.length === 0 ? "Skip" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canAdvance() || sending}
            className="btn btn-primary btn-lg"
            type="button"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Book my free assessment
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================ subparts == */

function PhotoStep({
  photos,
  onChange,
  details,
  onDetails,
}: {
  photos: File[];
  onChange: (p: File[]) => void;
  details: string;
  onDetails: (v: string) => void;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  return (
    <div className="space-y-6">
      <Group
        label="Photos of the glass (optional)"
        hint="A shot from outside and one from inside tells us more than any description."
      >
        <div className="flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <div key={src} className="relative">
              <img
                src={src}
                alt={`Upload ${i + 1}`}
                className="h-24 w-24 rounded-md border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-foreground ring-1 ring-border"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-md border border-dashed border-line-strong text-muted-foreground transition-colors hover:border-accent hover:text-accent">
              <div className="text-center">
                <Camera className="mx-auto h-5 w-5" />
                <span className="mt-1 block text-[0.6875rem]">Add</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  onChange([...photos, ...picked].slice(0, MAX_PHOTOS));
                  e.target.value = "";
                }}
              />
              <span className="sr-only">Add photos of the glass</span>
            </label>
          )}
        </div>
      </Group>

      <Group label="Anything else? (optional)">
        <textarea
          value={details}
          onChange={(e) => onDetails(e.target.value)}
          rows={3}
          placeholder="Trading hours we should work around, a deadline, a specific look you're after…"
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-[0.9375rem] placeholder:text-faint-foreground focus:border-accent focus:outline-none"
        />
      </Group>
    </div>
  );
}

function Group({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-display text-lg font-semibold">{label}</legend>
      {hint && <p className="mb-4 mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
    </fieldset>
  );
}

function Chips({
  options,
  selected,
  onPick,
  multi = false,
}: {
  options: string[];
  selected: string[];
  onPick: (v: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <label
            key={o}
            className={`cursor-pointer rounded-full border px-4 py-2.5 text-[0.9375rem] transition-colors ${
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-line-strong hover:bg-surface-2"
            }`}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              name={multi ? undefined : "single"}
              checked={active}
              onChange={() => onPick(o)}
              className="sr-only"
            />
            {o}
          </label>
        );
      })}
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = `c-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full rounded-md border bg-background px-4 py-3 text-[0.9375rem] placeholder:text-faint-foreground focus:outline-none ${
          error ? "border-destructive" : "border-border focus:border-accent"
        }`}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
