import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Phone, AlertTriangle } from "lucide-react";
import { Reveal } from "./Reveal";
import { site } from "@/config/site";
import type { ServiceContent } from "@/content/services";
import {
  captureAttribution,
  isValidEmail,
  isValidPhone,
  submitLead,
} from "@/lib/leads";
import { trackLeadCaptured, trackQuoteAdsConversion } from "@/lib/analytics";

// Single-screen lead form for the business/commercial pages (building glass,
// fleet). These jobs aren't a year/make/model quote, so this replaces the
// vehicle-based EstimateForm — but posts through the same submitLead pipeline,
// so leads land in ShopFlow with attribution and fire the GA4 conversion.
type Errors = Partial<Record<"name" | "phone" | "email" | "project", string>>;

export function CommercialQuoteForm({ service }: { service: ServiceContent }) {
  const cfg = service.lead;
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  // Config is required for these variants; render nothing rather than crash if
  // a content entry forgets it (a build-time authoring mistake, not user-facing).
  if (!cfg) return null;

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Please enter your name";
    if (!isValidPhone(phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!isValidEmail(email)) e.email = "Enter a valid email address";
    if (!project) e.project = "Please choose one";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (sending) return;
    if (!validate()) return;
    setSending(true);
    setSubmitError(null);

    const notes = [
      business.trim() && `Business: ${business.trim()}`,
      project && `${cfg.selectLabel}: ${project}`,
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const res = await submitLead({
      name,
      phone,
      email,
      service: service.serviceName,
      goal,
      timeline: "",
      notes,
      // No vehicle on a building/fleet inquiry — the pipeline expects the shape.
      vehicle: { year: "", make: "", model: "", color: "", type: "" },
      honeypot,
    });

    setSending(false);
    if (res.ok) {
      setSubmitted(true);
      trackLeadCaptured(service.serviceName);
      trackQuoteAdsConversion();
    } else {
      setSubmitError(
        res.error === "network"
          ? "We couldn't reach our system. Please try again in a minute — or call us and we'll take care of you right away."
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
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Request a Quote</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              Let's scope your {service.navLabel.toLowerCase()} project.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">{cfg.blurb}</p>

            <ul className="mt-8 space-y-3">
              {[
                "No obligation, ever",
                "Response within 1 business hour",
                "Custom quote for your project",
                "One point of contact",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={site.business.phoneHref}
              className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4 text-accent" />
              Prefer to talk it through? Call {site.business.phone}
            </a>
          </Reveal>

          <Reveal delay={100} className="rounded-3xl hairline bg-card p-6 sm:p-10 shadow-elevated">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full ember-gradient">
                  <Check className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mt-6 text-3xl">Request Received</h3>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                  Thanks, {name.trim().split(" ")[0]}. Your {service.navLabel.toLowerCase()} request
                  is in — we'll reach out shortly to set up your quote and next steps.
                </p>
                <p className="mt-6 text-xs text-muted-foreground">
                  Need it sooner?{" "}
                  <a href={site.business.phoneHref} className="text-accent hover:underline">
                    Call {site.business.phone}
                  </a>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <FieldGroup title="How can we reach you?">
                  <div className="grid gap-3">
                    <Input
                      label="Full name"
                      placeholder="Full name"
                      value={name}
                      onChange={setName}
                      error={errors.name}
                      autoComplete="name"
                    />
                    <Input
                      label="Business name"
                      placeholder="Business name (optional)"
                      value={business}
                      onChange={setBusiness}
                      autoComplete="organization"
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        label="Phone number"
                        placeholder="Phone"
                        value={phone}
                        onChange={setPhone}
                        error={errors.phone}
                        type="tel"
                        autoComplete="tel"
                      />
                      <Input
                        label="Email address"
                        placeholder="Email"
                        value={email}
                        onChange={setEmail}
                        error={errors.email}
                        type="email"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </FieldGroup>

                <FieldGroup title={cfg.selectLabel}>
                  <ChipGroup options={cfg.selectOptions} value={project} onChange={setProject} />
                  {errors.project && (
                    <span className="mt-2 block text-xs text-destructive">{errors.project}</span>
                  )}
                </FieldGroup>

                <FieldGroup title="What's the main goal? (optional)">
                  <ChipGroup options={cfg.goalOptions} value={goal} onChange={setGoal} />
                </FieldGroup>

                <FieldGroup title="Project details">
                  <label className="block">
                    <span className="sr-only">Project details</span>
                    <textarea
                      placeholder="Tell us about the space or fleet — number of windows/vehicles, timeline, anything else. (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl bg-surface hairline px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
                    />
                  </label>
                </FieldGroup>

                {/* Honeypot — hidden from humans, bots auto-fill it and the
                    server quietly discards the submission. */}
                <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>

                <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                  We only use your info to prepare your quote — no spam, no reselling.
                </p>

                {submitError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
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

                <button
                  onClick={submit}
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition shadow-glow"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Request My Quote
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
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
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  error?: string;
  type?: string;
  autoComplete?: string;
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
        aria-invalid={!!error}
        className={`w-full rounded-xl bg-surface hairline px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition ${
          error ? "border-destructive/60 ring-1 ring-destructive/40" : ""
        }`}
      />
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
