import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  Loader2,
  Phone,
  X,
  AlertTriangle,
} from "lucide-react";
import { site } from "@/config/site";
import { services, serviceBySlug } from "@/content/services";
import { CommercialQuoteForm } from "./CommercialQuoteForm";
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
  trackQuoteAdsConversion,
  trackQuoteComplete,
  trackQuoteError,
  trackQuoteStart,
  trackQuoteStep,
} from "@/lib/analytics";

/**
 * The quote flow. Five steps, in the order a customer can actually answer
 * them: what they want, what car, what outcome, optional photos, who they are.
 *
 * Two deliberate decisions:
 *   • No date/time picker. Asking someone to commit to an appointment slot
 *     before they know a price is the biggest drop-off point in a quote form,
 *     and Angelo confirms times by text anyway.
 *   • Contact details come LAST but are captured the moment they validate
 *     (speed-to-lead), so a visitor who abandons on the photo step is still a
 *     lead in ShopFlow rather than a lost session.
 */

type Data = {
  service: string;
  year: string;
  make: string;
  model: string;
  vehicleType: string;
  goal: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  photos: File[];
  honeypot: string;
};

const initial: Data = {
  service: "",
  year: "",
  make: "",
  model: "",
  vehicleType: "",
  goal: "",
  timeline: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
  photos: [],
  honeypot: "",
};

const STEPS = ["Service", "Vehicle", "Goals", "Photos", "Contact"] as const;
const vehicleTypes = ["Sedan / Coupe", "SUV / Crossover", "Truck", "Van", "EV / Tesla", "Other"];
const timelines = ["As soon as possible", "In the next few weeks", "Just planning ahead"];
const MAX_PHOTOS = 4;

type Errors = Partial<Record<"year" | "make" | "model" | "name" | "phone" | "email", string>>;

export function QuoteForm({
  defaultService,
  compact = false,
}: {
  /** Service page slug — locks the service and starts on the vehicle step. */
  defaultService?: string;
  compact?: boolean;
}) {
  const preset = defaultService ? serviceBySlug(defaultService) : undefined;
  const presetName = preset?.serviceName ?? "";

  const [step, setStep] = useState(presetName ? 1 : 0);
  const [data, setData] = useState<Data>(() => ({ ...initial, service: presetName }));
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startedRef = useRef(false);
  const leadSentFor = useRef<string | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  const currentService = services.find((s) => s.serviceName === data.service);
  // Building glass is a different job with different questions — a property
  // owner can't answer "year, make and model". Picking it here hands straight
  // over to the commercial flow rather than dead-ending in the vehicle steps.
  const isCommercial = currentService?.variant === "commercial";
  // Step 3 options follow the chosen service — a PPF buyer and a detail
  // customer want completely different things.
  const goalOptions = currentService?.goalOptions ?? [
    "Heat & comfort",
    "Appearance",
    "Protection",
    "Not sure yet",
  ];

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackQuoteStart(data.service || presetName || "unspecified");
    }
    setData((d) => ({ ...d, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateStep = (): boolean => {
    const e: Errors = {};
    if (step === 1) {
      if (!isValidYear(data.year)) e.year = "Enter a 4-digit year";
      if (data.make.trim().length < 2) e.make = "Required";
      if (data.model.trim().length < 1) e.model = "Required";
    }
    if (step === 4) {
      if (data.name.trim().length < 2) e.name = "Please enter your name";
      if (!isValidPhone(data.phone)) e.phone = "Enter a valid 10-digit phone number";
      if (!isValidEmail(data.email)) e.email = "Enter a valid email address";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canAdvance = () => {
    if (step === 0) return !!data.service;
    if (step === 1) return !!(data.year && data.make && data.model && data.vehicleType);
    if (step === 2) return !!(data.goal && data.timeline);
    if (step === 3) return true; // photos are optional by design
    if (step === 4) return !!(data.name && data.phone && data.email);
    return true;
  };

  const goTo = (next: number) => {
    setStep(next);
    // Move focus to the step heading so keyboard and screen-reader users
    // aren't left at the bottom of the form after advancing.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    if (!canAdvance() || !validateStep()) return;
    trackQuoteStep(step, STEPS[step], data.service);
    goTo(step + 1);
  };

  const back = () => goTo(Math.max(presetName ? 1 : 0, step - 1));

  const submit = async () => {
    if (!canAdvance() || !validateStep() || sending) return;
    setSending(true);
    setSubmitError(null);

    // Speed-to-lead: fire the lead as soon as we have valid details, before
    // the (slower, best-effort) photo upload, so a failed upload or a closed
    // tab can't cost Angelo the lead.
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      serviceTag: currentService?.leadValue,
      goal: data.goal,
      timeline: data.timeline,
      notes: data.notes,
      vehicle: {
        year: data.year,
        make: data.make,
        model: data.model,
        color: "",
        type: data.vehicleType,
      },
      honeypot: data.honeypot,
    };

    if (leadSentFor.current !== data.phone) {
      leadSentFor.current = data.phone;
      trackLeadCaptured(data.service);
      trackQuoteAdsConversion();
    }

    const photoUrls = data.photos.length ? await uploadPhotos(data.photos, MAX_PHOTOS) : [];
    const res = await submitLead({ ...payload, photoUrls });

    setSending(false);
    if (res.ok) {
      setSubmitted(true);
      trackQuoteComplete(data.service);
    } else {
      trackQuoteError(res.error || "unknown");
      setSubmitError(
        res.error === "network"
          ? "We couldn't reach our system just then. Try again in a moment — or call and we'll take care of it right away."
          : "Something went wrong sending that. Please try again, or give us a call.",
      );
    }
  };

  if (isCommercial && currentService?.lead) {
    return (
      <div>
        <button
          type="button"
          onClick={() => set("service", "")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Not a building? Pick another service
        </button>
        <CommercialQuoteForm lead={currentService.lead} />
      </div>
    );
  }

  /* ------------------------------------------------------------ success -- */
  if (submitted) {
    return (
      <div
        className={`panel ${compact ? "p-6" : "p-6 sm:p-10"}`}
        role="status"
        aria-live="polite"
        data-quote-state="success"
      >
        <div className="py-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
            <Check className="h-7 w-7 text-accent-foreground" strokeWidth={2.5} />
          </div>
          <h3 className="mt-6 font-display text-3xl">Got it, {data.name.trim().split(" ")[0]}.</h3>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Your request is in. We'll come back to you with a price for your {data.year} {data.make}{" "}
            {data.model} — usually the same day during shop hours.
          </p>

          <dl className="mx-auto mt-7 max-w-sm space-y-2.5 rounded-md border border-border bg-background/60 p-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="text-right">{data.service}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Vehicle</dt>
              <dd className="text-right">
                {data.year} {data.make} {data.model}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Looking for</dt>
              <dd className="text-right">{data.goal}</dd>
            </div>
          </dl>

          <p className="mt-6 text-sm text-muted-foreground">
            Need it sooner?{" "}
            <a href={site.business.phoneHref} className="text-accent underline underline-offset-4">
              Call {site.business.phone}
            </a>
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- form -- */
  const lastStep = step === STEPS.length - 1;

  return (
    <div className={`panel ${compact ? "p-5 sm:p-6" : "p-5 sm:p-8"}`}>
      {/* Progress */}
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
          <Field legend="What do you need?">
            <ChipGroup
              name="service"
              options={services.map((s) => s.serviceName)}
              value={data.service}
              onChange={(v) => set("service", v)}
            />
          </Field>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <Field legend="Your vehicle">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Input
                  label="Year"
                  value={data.year}
                  onChange={(v) => set("year", v)}
                  error={errors.year}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                />
                <Input
                  label="Make"
                  value={data.make}
                  onChange={(v) => set("make", v)}
                  error={errors.make}
                  placeholder="Toyota"
                />
                <Input
                  label="Model"
                  value={data.model}
                  onChange={(v) => set("model", v)}
                  error={errors.model}
                  placeholder="Camry"
                  className="col-span-2"
                />
              </div>
            </Field>
            <Field legend="Body type">
              <ChipGroup
                name="vehicleType"
                options={vehicleTypes}
                value={data.vehicleType}
                onChange={(v) => set("vehicleType", v)}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <Field legend="What are you looking for?">
              <ChipGroup
                name="goal"
                options={goalOptions}
                value={data.goal}
                onChange={(v) => set("goal", v)}
              />
            </Field>
            <Field legend="When are you hoping to get it done?">
              <ChipGroup
                name="timeline"
                options={timelines}
                value={data.timeline}
                onChange={(v) => set("timeline", v)}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <PhotoStep
            photos={data.photos}
            onChange={(p) => set("photos", p)}
            notes={data.notes}
            onNotes={(v) => set("notes", v)}
            service={data.service}
          />
        )}

        {step === 4 && (
          <div className="space-y-7">
            <Field legend="Where should we send your quote?">
              <div className="grid gap-3">
                <Input
                  label="Your name"
                  value={data.name}
                  onChange={(v) => set("name", v)}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Mobile number"
                  value={data.phone}
                  onChange={(v) => set("phone", v)}
                  error={errors.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  hint="We'll text your quote here."
                />
                <Input
                  label="Email"
                  value={data.email}
                  onChange={(v) => set("email", v)}
                  error={errors.email}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
            </Field>

            {/* Honeypot: bots fill it, humans never see it. */}
            <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="website-hp">Website</label>
              <input
                id="website-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={data.honeypot}
                onChange={(e) => setData((d) => ({ ...d, honeypot: e.target.value }))}
              />
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              We use your details to send this quote and follow up about it. No lists, no sharing,
              no spam.
            </p>
          </div>
        )}
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

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > (presetName ? 1 : 0) ? (
          <button onClick={back} className="btn btn-ghost" type="button">
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
                Get My Quote
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
  notes,
  onNotes,
  service,
}: {
  photos: File[];
  onChange: (p: File[]) => void;
  notes: string;
  onNotes: (v: string) => void;
  service: string;
}) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const hint =
    service === "Ceramic Coating"
      ? "Paint condition drives a coating quote more than anything else — a few shots in daylight help a lot."
      : service === "Paint Protection Film"
        ? "A photo of the front end tells us what's already chipped and how much coverage you need."
        : service === "Detail"
          ? "Photos of the interior get you a far more accurate number."
          : "Photos are optional — helpful if you have existing tint you want removed.";

  return (
    <div className="space-y-6">
      <Field legend="Add photos (optional)">
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">{hint}</p>

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
              <span className="sr-only">Add photos of your vehicle</span>
            </label>
          )}
        </div>
      </Field>

      <Field legend="Anything else we should know? (optional)">
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={3}
          placeholder="Existing tint to remove, a deadline, a specific look you're after…"
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-[0.9375rem] text-foreground placeholder:text-faint-foreground focus:border-accent focus:outline-none"
        />
      </Field>
    </div>
  );
}

function Field({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 font-display text-lg font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}

function ChipGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const active = o === value;
        return (
          <label
            key={o}
            className={`cursor-pointer rounded-full border px-4 py-2.5 text-[0.9375rem] transition-colors ${
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
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  className = "",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  autoComplete?: string;
  className?: string;
  maxLength?: number;
}) {
  const id = `f-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className={className}>
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
