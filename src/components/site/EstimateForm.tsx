import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Upload, CalendarIcon, Clock, Loader2, Phone, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Reveal } from "./Reveal";
import { site } from "@/config/site";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  captureAttribution,
  fetchAvailability,
  isValidEmail,
  isValidPhone,
  isValidYear,
  submitLead,
  uploadPhotos,
} from "@/lib/leads";

type Data = {
  service: string;
  year: string;
  make: string;
  model: string;
  color: string;
  vehicleType: string;
  goal: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  photos: File[];
  honeypot: string;
  appointmentDate: Date | undefined;
  appointmentTime: string;
};

const initial: Data = {
  service: "",
  year: "",
  make: "",
  model: "",
  color: "",
  vehicleType: "",
  goal: "",
  timeline: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
  photos: [],
  honeypot: "",
  appointmentDate: undefined,
  appointmentTime: "",
};

const services = site.services.map((s) => s.name);
const vehicleTypes = ["Sedan", "Coupe", "SUV", "Truck", "Van", "Tesla / EV", "Other"];
const goals = ["Heat Reduction", "UV Protection", "Privacy", "Appearance", "Interior Protection", "All of the above"];
const timelines = ["This week", "This month", "Next 2–3 months", "Just researching"];
// Fallback only — real open slots come from ShopFlow availability.
const fallbackSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

const steps = ["Service", "Vehicle", "Goals", "Details", "Schedule"];

type Errors = Partial<Record<"year" | "name" | "phone" | "email", string>>;

export function EstimateForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null); // null = loading/unknown
  const [slotsLive, setSlotsLive] = useState(false); // true when slots came from ShopFlow
  // Phone we already sent an early-capture lead for, so step bouncing
  // doesn't re-ping the owner.
  const partialSentFor = useRef<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // Pull real open slots from ShopFlow when a date is picked. Falls back to
  // the standard list if the API is unreachable (the shop confirms by text
  // anyway — the request is a preference, not a hard booking).
  useEffect(() => {
    if (!data.appointmentDate) return;
    let cancelled = false;
    setSlots(null);
    setSlotsLive(false);
    fetchAvailability(format(data.appointmentDate, "yyyy-MM-dd")).then((live) => {
      if (cancelled) return;
      if (live) {
        setSlots(live);
        setSlotsLive(true);
      } else {
        setSlots(fallbackSlots);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data.appointmentDate]);

  const validateStep = (): boolean => {
    const e: Errors = {};
    if (step === 1) {
      if (!isValidYear(data.year)) e.year = "Enter a 4-digit year";
    }
    if (step === 3) {
      if (data.name.trim().length < 2) e.name = "Please enter your name";
      if (!isValidPhone(data.phone)) e.phone = "Enter a valid 10-digit phone number";
      if (!isValidEmail(data.email)) e.email = "Enter a valid email address";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canNext = () => {
    if (step === 0) return !!data.service;
    if (step === 1) return !!(data.year && data.make && data.model && data.color && data.vehicleType);
    if (step === 2) return !!(data.goal && data.timeline);
    if (step === 3) return !!(data.name && data.phone && data.email);
    if (step === 4) return !!(data.appointmentDate && data.appointmentTime);
    return true;
  };

  const handleNext = () => {
    if (!canNext() || !validateStep()) return;
    // Speed-to-lead: the moment we have valid contact details, capture the
    // lead — even if the visitor never finishes scheduling. Fire-and-forget;
    // the final submit is authoritative and the server dedupes by phone.
    if (step === 3 && partialSentFor.current !== data.phone) {
      partialSentFor.current = data.phone;
      submitLead({
        name: data.name,
        phone: data.phone,
        email: data.email,
        service: data.service,
        goal: data.goal,
        timeline: data.timeline,
        notes: data.notes,
        vehicle: { year: data.year, make: data.make, model: data.model, color: data.color, type: data.vehicleType },
        honeypot: data.honeypot,
      }).catch(() => {});
    }
    setStep((s) => s + 1);
  };

  // One authoritative submit at the end: photos first (best-effort), then the
  // lead with the appointment request. No fake success — if ShopFlow can't be
  // reached, the customer is told and given the phone number instead.
  const submit = async () => {
    if (!canNext() || !validateStep() || sending) return;
    setSending(true);
    setSubmitError(null);

    const photoUrls = data.photos.length ? await uploadPhotos(data.photos) : [];
    const res = await submitLead({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      goal: data.goal,
      timeline: data.timeline,
      notes: data.notes,
      vehicle: { year: data.year, make: data.make, model: data.model, color: data.color, type: data.vehicleType },
      appointment: data.appointmentDate
        ? { date: format(data.appointmentDate, "EEEE, MMMM d, yyyy"), time: data.appointmentTime }
        : undefined,
      photoUrls,
      honeypot: data.honeypot,
    });

    setSending(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setSubmitError(
        res.error === "network"
          ? "We couldn't reach our booking system. Please try again in a minute — or call us and we'll take care of you right away."
          : res.error || "Something went wrong. Please try again or give us a call."
      );
    }
  };

  return (
    <section id="quote" className="relative py-24 sm:py-32 bg-surface/30 noise">
      <div className="pointer-events-none absolute top-1/3 left-0 h-[400px] w-[400px] glow-orb" />

      <div className="container-x relative">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Free Estimate</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              Get your personalized tint quote in 60 seconds.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Tell us a little about your vehicle and goals. We'll match you with the
              perfect film and shade — and get you an accurate price.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "No obligation, ever",
                "Response within 1 business hour",
                "Transparent flat-rate pricing",
                "Financing available",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100} className="rounded-3xl hairline bg-card p-6 sm:p-10 shadow-elevated">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full ember-gradient">
                  <Check className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mt-6 text-3xl">Request Received</h3>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                  Thanks, {data.name.trim().split(" ")[0]}. Your quote request is in —
                  we'll text you shortly to confirm your time and lock in your price.
                </p>
                <div className="mt-8 mx-auto max-w-sm rounded-2xl hairline bg-surface/60 p-5 text-left">
                  <div className="text-xs uppercase tracking-[0.18em] text-accent mb-3">
                    Requested time
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="h-4 w-4 text-accent" />
                    <span>{data.appointmentDate ? format(data.appointmentDate, "EEEE, MMMM d, yyyy") : ""}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{data.appointmentTime}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                    <div>{data.service}</div>
                    <div className="mt-1">{data.year} {data.make} {data.model}</div>
                  </div>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Need it sooner?{" "}
                  <a href={site.business.phoneHref} className="text-accent hover:underline">
                    Call {site.business.phone}
                  </a>
                </p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    {steps.map((s, i) => (
                      <div key={s} className="flex-1 text-center">
                        <div
                          className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-xs font-medium transition-all ${
                            i < step
                              ? "bg-accent text-accent-foreground"
                              : i === step
                              ? "bg-accent text-accent-foreground shadow-glow"
                              : "bg-surface-elevated text-muted-foreground"
                          }`}
                        >
                          {i < step ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <div
                          className={`mt-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] ${
                            i <= step ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {s}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-1 rounded-full bg-surface-elevated overflow-hidden">
                    <div
                      className="h-full ember-gradient transition-all duration-500"
                      style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div key={step} className="animate-fade-up">
                  {step === 0 && (
                    <FieldGroup title="What service are you interested in?">
                      <ChipGroup
                        options={services}
                        value={data.service}
                        onChange={(v) => set("service", v)}
                      />
                    </FieldGroup>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <FieldGroup title="Your vehicle">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <Input
                            label="Vehicle year"
                            placeholder="Year"
                            value={data.year}
                            onChange={(v) => set("year", v)}
                            error={errors.year}
                            inputMode="numeric"
                          />
                          <Input label="Vehicle make" placeholder="Make" value={data.make} onChange={(v) => set("make", v)} />
                          <Input label="Vehicle model" placeholder="Model" value={data.model} onChange={(v) => set("model", v)} />
                          <Input
                            label="Vehicle color"
                            placeholder="Color"
                            value={data.color}
                            onChange={(v) => set("color", v)}
                            className="col-span-2 sm:col-span-3"
                          />
                        </div>
                      </FieldGroup>
                      <FieldGroup title="Vehicle type">
                        <ChipGroup
                          options={vehicleTypes}
                          value={data.vehicleType}
                          onChange={(v) => set("vehicleType", v)}
                        />
                      </FieldGroup>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <FieldGroup title="What's your main goal?">
                        <ChipGroup options={goals} value={data.goal} onChange={(v) => set("goal", v)} />
                      </FieldGroup>
                      <FieldGroup title="When are you looking to book?">
                        <ChipGroup
                          options={timelines}
                          value={data.timeline}
                          onChange={(v) => set("timeline", v)}
                        />
                      </FieldGroup>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <FieldGroup title="How can we reach you?">
                        <div className="grid gap-3">
                          <Input
                            label="Full name"
                            placeholder="Full name"
                            value={data.name}
                            onChange={(v) => set("name", v)}
                            error={errors.name}
                            autoComplete="name"
                          />
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                              label="Phone number"
                              placeholder="Phone"
                              value={data.phone}
                              onChange={(v) => set("phone", v)}
                              error={errors.phone}
                              type="tel"
                              autoComplete="tel"
                            />
                            <Input
                              label="Email address"
                              placeholder="Email"
                              value={data.email}
                              onChange={(v) => set("email", v)}
                              error={errors.email}
                              type="email"
                              autoComplete="email"
                            />
                          </div>
                          {/* Honeypot — hidden from humans, bots auto-fill it and the
                              server quietly discards the submission. */}
                          <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                            <label>
                              Website
                              <input
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={data.honeypot}
                                onChange={(e) => set("honeypot", e.target.value)}
                              />
                            </label>
                          </div>
                          <label className="block">
                            <span className="sr-only">Anything else we should know?</span>
                            <textarea
                              placeholder="Anything else we should know? (optional)"
                              value={data.notes}
                              onChange={(e) => set("notes", e.target.value)}
                              rows={3}
                              className="w-full rounded-xl bg-surface hairline px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                            />
                          </label>
                          <label className="flex items-center justify-center gap-2 rounded-xl hairline border-dashed bg-surface/40 px-4 py-4 text-sm text-muted-foreground cursor-pointer hover:bg-surface transition">
                            <Upload className="h-4 w-4" />
                            {data.photos.length > 0
                              ? `${data.photos.length} photo(s) attached`
                              : "Upload vehicle photos (optional, up to 3)"}
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                set("photos", Array.from(e.target.files ?? []).slice(0, 3))
                              }
                            />
                          </label>
                          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                            Next, pick a time that works for you. We only use your info to
                            prepare your quote — no spam, no reselling.
                          </p>
                        </div>
                      </FieldGroup>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <FieldGroup title="Pick a date">
                        <div className="rounded-2xl hairline bg-surface/40 p-2 sm:p-3 inline-block">
                          <Calendar
                            mode="single"
                            selected={data.appointmentDate}
                            onSelect={(d) => {
                              set("appointmentDate", d);
                              set("appointmentTime", "");
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today || date.getDay() === 0;
                            }}
                            className={cn("pointer-events-auto")}
                          />
                        </div>
                      </FieldGroup>
                      <FieldGroup
                        title={
                          data.appointmentDate
                            ? `Available times · ${format(data.appointmentDate, "EEE, MMM d")}`
                            : "Select a date to see times"
                        }
                      >
                        {data.appointmentDate && slots === null ? (
                          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking open times…
                          </div>
                        ) : data.appointmentDate && slots && slots.length === 0 ? (
                          <p className="py-4 text-sm text-muted-foreground">
                            That day is fully booked — try another date, or{" "}
                            <a href={site.business.phoneHref} className="text-accent hover:underline">
                              call us
                            </a>{" "}
                            and we'll see what we can do.
                          </p>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {(slots ?? fallbackSlots).map((t) => {
                                const active = t === data.appointmentTime;
                                const disabled = !data.appointmentDate;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => set("appointmentTime", t)}
                                    className={cn(
                                      "rounded-xl px-3 py-3 text-sm transition-all",
                                      active
                                        ? "bg-accent text-accent-foreground shadow-glow"
                                        : "hairline text-foreground hover:bg-surface-elevated",
                                      disabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                                    )}
                                  >
                                    {t}
                                  </button>
                                );
                              })}
                            </div>
                            {slotsLive && (
                              <p className="mt-3 text-[11px] text-muted-foreground/80">
                                Live availability — these times are open right now.
                              </p>
                            )}
                          </>
                        )}
                      </FieldGroup>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                    <div>
                      {submitError}
                      <a
                        href={site.business.phoneHref}
                        className="mt-1 flex items-center gap-1.5 text-accent hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {site.business.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || sending}
                    className="inline-flex items-center gap-2 rounded-full hairline px-5 py-3 text-sm text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  {step < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      disabled={!canNext()}
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition shadow-glow"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={!canNext() || sending}
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition shadow-glow"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Request Appointment
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">{title}</div>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o)}
            className={`rounded-full px-4 py-2.5 text-sm transition-all ${
              active
                ? "bg-accent text-accent-foreground shadow-glow"
                : "hairline text-foreground hover:bg-surface-elevated"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  className = "",
  error,
  type = "text",
  autoComplete,
  inputMode,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
}) {
  return (
    <label className={`block ${className}`}>
      <span className="sr-only">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={!!error}
        className={`w-full rounded-xl bg-surface hairline px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition ${
          error ? "border-destructive/60 ring-1 ring-destructive/40" : ""
        }`}
      />
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
