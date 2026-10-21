import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2, Phone } from "lucide-react";
import { site } from "@/config/site";
import { captureAttribution, isValidEmail, isValidPhone, submitLead } from "@/lib/leads";
import {
  trackLeadCaptured,
  trackQuoteAdsConversion,
  trackQuoteComplete,
  trackQuoteError,
  trackQuoteStart,
} from "@/lib/analytics";

/**
 * Dealer account enquiry — one screen.
 *
 * A dealer isn't quoting one car, so year/make/model is the wrong question.
 * What Angelo needs to price an account is who the store is, which services,
 * and roughly how many cars a month. Everything lands in the ShopFlow lead's
 * notes under a "DEALER ACCOUNT" header so it's obvious in the inbox.
 */

const SERVICE = "Dealer Program";

/** Label on the form → ShopFlow lead-form option (must match exactly). */
const SERVICES: { label: string; leadValue: string }[] = [
  { label: "Window tint", leadValue: "Window tint" },
  { label: "Paint protection film", leadValue: "PPF" },
  { label: "Ceramic coating", leadValue: "Ceramic Coating" },
  { label: "Detailing / recon", leadValue: "Detail" },
];

const VOLUME = ["1–5 a month", "6–15 a month", "16–30 a month", "30+ a month", "Not sure yet"];

const KIND = ["Franchise / new car", "Independent / used", "Fleet / commercial", "Other"];

type Data = {
  dealership: string;
  kind: string;
  services: string[];
  volume: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  honeypot: string;
};

const initial: Data = {
  dealership: "",
  kind: "",
  services: [],
  volume: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
  honeypot: "",
};

export function DealerForm() {
  const [data, setData] = useState<Data>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!started.current) {
      started.current = true;
      trackQuoteStart(SERVICE);
    }
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const toggleService = (label: string) =>
    set(
      "services",
      data.services.includes(label)
        ? data.services.filter((s) => s !== label)
        : [...data.services, label],
    );

  const validate = () => {
    const e: typeof errors = {};
    if (!data.dealership.trim()) e.dealership = "Which dealership is this for?";
    if (!data.name.trim()) e.name = "Who should we ask for?";
    if (!isValidPhone(data.phone)) e.phone = "A number we can call or text.";
    if (data.email.trim() && !isValidEmail(data.email)) e.email = "That email doesn't look right.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending || !validate()) return;
    setSending(true);
    setError(null);
    trackLeadCaptured(SERVICE);
    trackQuoteAdsConversion();

    const first = SERVICES.find((s) => s.label === data.services[0]);
    const res = await submitLead({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: SERVICE,
      serviceTag: first?.leadValue ?? "Detail",
      goal: "",
      timeline: "",
      notes: data.notes,
      extraLines: [
        "— DEALER ACCOUNT ENQUIRY —",
        `Dealership: ${data.dealership.trim()}`,
        data.kind && `Type: ${data.kind}`,
        data.services.length && `Interested in: ${data.services.join(", ")}`,
        data.volume && `Volume: ${data.volume}`,
      ].filter(Boolean) as string[],
      vehicle: { year: "", make: "", model: "", type: "" },
      // An account enquiry has no single vehicle to put in the required
      // vehicle custom fields.
      skipRequiredCustomFields: true,
      honeypot: data.honeypot,
    });

    setSending(false);
    if (res.ok) {
      setSent(true);
      trackQuoteComplete(SERVICE);
    } else {
      trackQuoteError(res.error || "unknown");
      setError(
        res.error && res.error !== "network"
          ? res.error
          : "We couldn't send that just then. Try again in a moment, or give the shop a call.",
      );
    }
  };

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
          We've got {data.dealership.trim()} down. Angelo will call to talk through the cars, the
          services and how you'd like to work it.
        </p>
        <a
          href={site.business.phoneHref}
          className="mt-6 inline-flex items-center gap-1.5 font-medium text-accent"
        >
          <Phone className="h-4 w-4" />
          Can't wait? {site.business.phone}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="panel p-6 sm:p-8">
      <div className="space-y-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <Text
            label="Dealership"
            value={data.dealership}
            onChange={(v) => set("dealership", v)}
            error={errors.dealership}
            autoComplete="organization"
            className="sm:col-span-2"
          />
        </div>

        <Group label="What kind of store?">
          <Chips options={KIND} selected={[data.kind]} onPick={(v) => set("kind", v)} name="kind" />
        </Group>

        <Group label="What do you need done?" hint="Pick any. We'll talk through the rest.">
          <Chips
            options={SERVICES.map((s) => s.label)}
            selected={data.services}
            onPick={toggleService}
            multi
          />
        </Group>

        <Group label="Roughly how many cars?">
          <Chips
            options={VOLUME}
            selected={[data.volume]}
            onPick={(v) => set("volume", v)}
            name="volume"
          />
        </Group>

        <Group label="Who should we call?">
          <div className="grid gap-3 sm:grid-cols-2">
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
              label="Email (optional)"
              value={data.email}
              onChange={(v) => set("email", v)}
              error={errors.email}
              type="email"
              autoComplete="email"
              className="sm:col-span-2"
            />
          </div>
        </Group>

        <Group label="Anything else? (optional)">
          <textarea
            value={data.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Your role, a car you need done this week, how you handle recon today…"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-[0.9375rem] placeholder:text-faint-foreground focus:border-accent focus:outline-none"
          />
        </Group>

        <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="d-website">Website</label>
          <input
            id="d-website"
            tabIndex={-1}
            autoComplete="off"
            value={data.honeypot}
            onChange={(e) => setData((d) => ({ ...d, honeypot: e.target.value }))}
          />
        </div>
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

      <button type="submit" disabled={sending} className="btn btn-primary btn-lg mt-8 w-full">
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Set up a dealer account
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        We use your details to set up the account and follow up about it. Nothing else.
      </p>
    </form>
  );
}

/* ============================================================ subparts == */

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
  name,
}: {
  options: string[];
  selected: string[];
  onPick: (v: string) => void;
  multi?: boolean;
  name?: string;
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
              name={multi ? undefined : `d-${name}`}
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
  type = "text",
  autoComplete,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  const id = `d-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full rounded-md border bg-background px-4 py-3 text-[0.9375rem] placeholder:text-faint-foreground focus:outline-none ${
          error ? "border-destructive" : "border-border focus:border-accent"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
