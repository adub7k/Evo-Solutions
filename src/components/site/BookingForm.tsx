/**
 * Online booking with a deposit — the site's only priced surface (site.booking).
 *
 * One page, five short sections, with a running summary beside it (below it
 * on mobile): service → vehicle → extras → day & time → contact. Every number
 * on it is ShopFlow's: prices per vehicle size, job length, which start times
 * still fit the whole job, and the deposit. Submitting creates the appointment
 * in ShopFlow and hands off to Square's hosted checkout; Square sends the
 * customer back to /book/confirmed. ShopFlow re-checks the slot and the price
 * server-side, so nothing here can book a taken time or a wrong amount.
 */

import { useEffect, useId, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Loader2, Phone, ShieldCheck } from "lucide-react";

import { Input } from "@/components/site/LandingLeadForm";
import { site } from "@/config/site";
import {
  addonsFor,
  book,
  depositCheckout,
  bookableDays,
  BOOKING_GROUPS,
  fetchBookingMenu,
  fetchSlots,
  formatBookingDate,
  fromPrice,
  hoursLabel,
  isoDate,
  priceFor,
  saveSummary,
  type BookableService,
  type BookResult,
  type BookingMenu,
} from "@/lib/booking";
import { captureAttribution, isValidEmail, isValidPhone, isValidYear } from "@/lib/leads";
import { money } from "@/lib/pricing";
import { optionKey } from "@/content/landing";
import { trackBookingCheckout, trackPhoneClick, trackQuoteClick } from "@/lib/analytics";

type Errors = Partial<
  Record<"service" | "size" | "vehicle" | "slot" | "name" | "phone" | "email", string>
>;

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function BookingForm({ preset }: { preset?: string }) {
  const [menu, setMenu] = useState<BookingMenu | null | undefined>(undefined);
  useEffect(() => {
    captureAttribution();
    let alive = true;
    fetchBookingMenu().then((m) => alive && setMenu(m));
    return () => {
      alive = false;
    };
  }, []);

  if (menu === undefined) {
    return (
      <div className="panel grid min-h-[22rem] place-items-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading booking" />
      </div>
    );
  }
  if (!menu) return <BookingUnavailable />;
  return <BookingStages menu={menu} preset={preset} />;
}

function BookingUnavailable() {
  return (
    <div className="panel p-6 sm:p-8">
      <h2 className="font-display text-xl">Online booking isn't available right now</h2>
      <p className="mt-2 text-muted-foreground">
        Call or text the shop and we'll get you on the calendar — or send a quote request and we'll
        come back to you.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={site.business.phoneHref}
          onClick={() => trackPhoneClick("book-unavailable")}
          className="btn btn-primary btn-lg"
        >
          <Phone className="h-4 w-4" />
          {site.business.phone}
        </a>
        <Link
          to="/quote"
          onClick={() => trackQuoteClick("book-unavailable")}
          className="btn btn-ghost btn-lg"
        >
          Get a free quote
        </Link>
      </div>
    </div>
  );
}

function BookingStages({ menu, preset }: { menu: BookingMenu; preset?: string }) {
  const id = useId();
  const navigate = useNavigate();

  const [serviceId, setServiceId] = useState<string | null>(
    () => menu.services.find((s) => preset && optionKey(s.name) === preset)?.id ?? null,
  );
  const [sizeKey, setSizeKey] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, string[] | null>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    year: "",
    make: "",
    model: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  // A booking created whose checkout didn't open: retrying with the same
  // details reopens checkout for it rather than booking twice.
  const [unpaid, setUnpaid] = useState<{ id: string; sig: string } | null>(null);

  const service = menu.services.find((s) => s.id === serviceId) ?? null;
  const extras = service ? addonsFor(menu, service) : [];
  const chosenExtras = extras.filter((a) => addonIds.includes(a.id));
  const base = service ? priceFor(service, sizeKey) : null;
  const total = base == null ? null : base + chosenExtras.reduce((t, a) => t + a.price, 0);
  const deposit = menu.deposit?.amount ?? 0;
  const days = useMemo(() => bookableDays(menu), [menu]);
  const slotKey = date && service ? `${date}|${service.id}` : null;
  const daySlots = slotKey ? slots[slotKey] : undefined;

  // Slots depend on the job's length, so they're fetched per (date, service).
  useEffect(() => {
    if (!slotKey || slotKey in slots) return;
    const [d, sid] = slotKey.split("|");
    let alive = true;
    fetchSlots(d, sid).then((list) => alive && setSlots((m) => ({ ...m, [slotKey]: list })));
    return () => {
      alive = false;
    };
  }, [slotKey, slots]);

  // A time picked for one service may not fit a longer one.
  useEffect(() => {
    if (time && Array.isArray(daySlots) && !daySlots.includes(time)) setTime(null);
  }, [daySlots, time]);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({
      ...e,
      [k === "year" || k === "make" || k === "model" ? "vehicle" : k]: undefined,
    }));
  };

  const pickService = (s: BookableService) => {
    setServiceId(s.id);
    setAddonIds((ids) => ids.filter((x) => addonsFor(menu, s).some((a) => a.id === x)));
    setErrors((e) => ({ ...e, service: undefined }));
  };

  function validate(): Errors {
    const e: Errors = {};
    if (!service) e.service = "Pick what you'd like done.";
    if (service?.sizes && !sizeKey) e.size = "Pick your vehicle size — it sets the price.";
    if (!isValidYear(form.year) || !form.make.trim() || !form.model.trim())
      e.vehicle = "Year, make and model, please.";
    if (!date || !time) e.slot = "Pick a day and a time.";
    if (!form.name.trim()) e.name = "Your name, please.";
    if (!isValidPhone(form.phone)) e.phone = "A 10-digit mobile number, please.";
    if (form.email.trim() && !isValidEmail(form.email)) e.email = "That email doesn't look right.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFailure(null);
    const first = Object.keys(e)[0];
    if (first) {
      document
        .getElementById(`${id}-sec-${first}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!service || !date || !time || total == null) return;

    setSending(true);
    const sig = JSON.stringify([service.id, sizeKey, addonIds, date, time, form]);
    const res: BookResult =
      unpaid && unpaid.sig === sig
        ? await depositCheckout(unpaid.id).then((url) =>
            url
              ? { ok: true as const, appointmentId: unpaid.id, checkoutUrl: url }
              : { ok: false as const, error: "deposit", appointmentId: unpaid.id },
          )
        : await book(
            {
              service,
              sizeKey: service.sizes ? sizeKey : null,
              addonIds,
              date,
              time,
              name: form.name,
              phone: form.phone,
              email: form.email,
              vehicle: { year: form.year, make: form.make, model: form.model },
              notes: form.notes,
            },
            menu.deposit?.amount ?? null,
          );

    if (!res.ok) {
      setSending(false);
      if (res.slotTaken) {
        setTime(null);
        if (slotKey)
          setSlots((m) => {
            const n = { ...m };
            delete n[slotKey];
            return n;
          });
        setErrors({ slot: "Someone just took that time — please pick another." });
        document
          .getElementById(`${id}-sec-slot`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setFailure(res.error);
        setUnpaid(res.appointmentId ? { id: res.appointmentId, sig } : null);
      }
      return;
    }

    const size = menu.sizes.find((s) => s.key === sizeKey);
    saveSummary({
      id: res.appointmentId,
      service: service.name,
      serviceSlug: service.slug,
      vehicle:
        [form.year, form.make, form.model].map((x) => x.trim()).join(" ") +
        (size && service.sizes ? ` (${size.label})` : ""),
      addons: chosenExtras.map((a) => a.name),
      date,
      time,
      total,
      deposit: res.checkoutUrl ? deposit : 0,
    });

    if (res.checkoutUrl) {
      trackBookingCheckout(service.name, total, deposit);
      window.location.href = res.checkoutUrl;
      return; // keep the spinner up while the browser leaves
    }
    navigate({
      to: "/book/confirmed",
      search: { booking: res.appointmentId, status: "confirmed" },
    });
  }

  const groups = site.booking.services.filter((slug) => menu.services.some((s) => s.slug === slug));

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10"
    >
      <div className="min-w-0 space-y-6">
        {/* 1 — service */}
        <Section n={1} title="What are we doing?" id={`${id}-sec-service`} error={errors.service}>
          <div className="space-y-6">
            {groups.map((slug) => (
              <div key={slug}>
                <p className="eyebrow mb-3">{BOOKING_GROUPS[slug] ?? slug}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {menu.services
                    .filter((s) => s.slug === slug)
                    .map((s) => {
                      const active = s.id === serviceId;
                      const exact = priceFor(s, sizeKey);
                      const max = s.sizes ? Math.max(...Object.values(s.sizes)) : null;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => pickService(s)}
                          aria-pressed={active}
                          className={`relative rounded-lg border p-4 text-left transition-colors ${
                            active
                              ? "border-accent bg-accent-soft"
                              : "border-border hover:border-line-strong hover:bg-surface-2"
                          }`}
                        >
                          {active && (
                            <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <span className="block pr-7 font-display font-semibold">{s.name}</span>
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {hoursLabel(s.duration)}
                          </span>
                          <span className="mt-3 block font-display text-lg font-bold text-foreground">
                            {exact != null
                              ? money(exact)
                              : max != null && max !== fromPrice(s)
                                ? `${money(fromPrice(s))}–${money(max)}`
                                : money(fromPrice(s))}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Looking for PPF, ceramic coating, detailing or something custom?{" "}
            <Link
              to="/quote"
              onClick={() => trackQuoteClick("book-page")}
              className="text-accent underline underline-offset-4"
            >
              Get a free quote
            </Link>{" "}
            instead.
          </p>
        </Section>

        {/* 2 — vehicle */}
        <Section n={2} title="What do you drive?" id={`${id}-sec-vehicle`} error={errors.vehicle}>
          {menu.sizes.length > 0 && (!service || service.sizes) && (
            <fieldset id={`${id}-sec-size`} className="mb-5">
              <legend className="mb-3 text-sm text-muted-foreground">Vehicle size</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {menu.sizes.map((sz) => {
                  const active = sz.key === sizeKey;
                  const p = service?.sizes?.[sz.key];
                  return (
                    <button
                      type="button"
                      key={sz.key}
                      aria-pressed={active}
                      onClick={() => {
                        setSizeKey(sz.key);
                        setErrors((e) => ({ ...e, size: undefined }));
                      }}
                      className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                        active ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2"
                      }`}
                    >
                      <span className="block font-semibold">{sz.label}</span>
                      {p != null && <span className="text-muted-foreground">{money(p)}</span>}
                    </button>
                  );
                })}
              </div>
              {errors.size && <p className="mt-2 text-xs text-destructive">{errors.size}</p>}
            </fieldset>
          )}
          <div className="grid gap-3 sm:grid-cols-[6rem_1fr_1fr]">
            <Input
              idPrefix={id}
              label="Year"
              value={form.year}
              onChange={(v) => set("year", v)}
              inputMode="numeric"
              maxLength={4}
              placeholder="2022"
            />
            <Input
              idPrefix={id}
              label="Make"
              value={form.make}
              onChange={(v) => set("make", v)}
              placeholder="Toyota"
            />
            <Input
              idPrefix={id}
              label="Model"
              value={form.model}
              onChange={(v) => set("model", v)}
              placeholder="Tacoma"
            />
          </div>
        </Section>

        {/* 3 — extras (only when the chosen service has any) */}
        {service && extras.length > 0 && (
          <Section n={3} title="Anything extra?" id={`${id}-sec-extras`} optional>
            <div className="grid gap-2 sm:grid-cols-2">
              {extras.map((a) => {
                const on = addonIds.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
                      on ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          setAddonIds((ids) =>
                            on ? ids.filter((x) => x !== a.id) : [...ids, a.id],
                          )
                        }
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      {a.name}
                    </span>
                    <span className="text-muted-foreground">+{money(a.price)}</span>
                  </label>
                );
              })}
            </div>
          </Section>
        )}

        {/* 4 — day & time */}
        <Section
          n={service && extras.length ? 4 : 3}
          title="Pick a day and time"
          id={`${id}-sec-slot`}
          error={errors.slot}
        >
          {!service ? (
            <p className="text-sm text-muted-foreground">
              Choose a service first — open times depend on how long the job takes.
            </p>
          ) : (
            <>
              <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
                role="radiogroup"
                aria-label="Day"
              >
                {days.map((d) => {
                  const iso = isoDate(d);
                  const active = iso === date;
                  return (
                    <button
                      type="button"
                      key={iso}
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setDate(iso);
                        setTime(null);
                        setErrors((e) => ({ ...e, slot: undefined }));
                      }}
                      className={`shrink-0 rounded-md border px-3.5 py-2.5 text-center text-sm transition-colors ${
                        active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:bg-surface-2"
                      }`}
                    >
                      <span className="block text-xs opacity-80">{dayFmt.format(d)}</span>
                      <span className="block font-semibold">{dateFmt.format(d)}</span>
                    </button>
                  );
                })}
              </div>

              {date && (
                <div className="mt-4">
                  {daySlots === undefined ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Checking the calendar…
                    </p>
                  ) : daySlots === null ? (
                    <p className="text-sm text-muted-foreground">
                      Couldn't load times — try again, or call {site.business.phone}.
                    </p>
                  ) : daySlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No room for a {hoursLabel(service.duration).replace("about ", "")} job that
                      day. Try another day.
                    </p>
                  ) : (
                    <div
                      className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                      role="radiogroup"
                      aria-label="Time"
                    >
                      {daySlots.map((t) => {
                        const active = t === time;
                        return (
                          <button
                            type="button"
                            key={t}
                            role="radio"
                            aria-checked={active}
                            onClick={() => {
                              setTime(t);
                              setErrors((e) => ({ ...e, slot: undefined }));
                            }}
                            className={`rounded-md border px-2 py-2.5 text-sm transition-colors ${
                              active
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border hover:bg-surface-2"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Section>

        {/* 5 — contact */}
        <Section n={service && extras.length ? 5 : 4} title="Your details" id={`${id}-sec-name`}>
          <div className="grid gap-3 sm:grid-cols-2" id={`${id}-sec-phone`}>
            <Input
              idPrefix={id}
              label="Your name"
              value={form.name}
              onChange={(v) => set("name", v)}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              idPrefix={id}
              label="Mobile number"
              value={form.phone}
              onChange={(v) => set("phone", v)}
              error={errors.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              hint="We'll text if anything changes."
            />
            <div id={`${id}-sec-email`}>
              <Input
                idPrefix={id}
                label="Email (optional)"
                value={form.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
            </div>
            <Input
              idPrefix={id}
              label="Anything we should know? (optional)"
              value={form.notes}
              onChange={(v) => set("notes", v)}
            />
          </div>
        </Section>
      </div>

      {/* Summary — sticky beside the form on desktop, after it on mobile. */}
      <aside className="panel p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="eyebrow">Your booking</p>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Service" value={service?.name} />
          {service?.sizes && (
            <Row label="Vehicle size" value={menu.sizes.find((s) => s.key === sizeKey)?.label} />
          )}
          {chosenExtras.map((a) => (
            <Row key={a.id} label={a.name} value={`+${money(a.price)}`} />
          ))}
          <Row
            label="When"
            value={
              date && time
                ? `${formatBookingDate(date)}, ${time}`
                : date
                  ? formatBookingDate(date)
                  : undefined
            }
          />
        </dl>
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-bold">
              {total != null ? money(total) : "—"}
            </span>
          </div>
          {deposit > 0 && (
            <div className="mt-1 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Due today</span>
              <span className="font-semibold text-accent">{money(deposit)} deposit</span>
            </div>
          )}
          {deposit > 0 && total != null && (
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {money(Math.max(total - deposit, 0))} at pickup
            </p>
          )}
        </div>

        {failure && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm"
          >
            {failure === "deposit"
              ? "The payment page didn't open, so your time isn't held yet. Tap the button to try again, or call:"
              : failure === "network"
                ? "We couldn't reach the booking system. Check your connection, or call:"
                : `${failure}. You can also call:`}{" "}
            <a
              href={site.business.phoneHref}
              onClick={() => trackPhoneClick("book-error")}
              className="font-semibold text-accent"
            >
              {site.business.phone}
            </a>
          </div>
        )}

        <button type="submit" disabled={sending} className="btn btn-primary btn-lg mt-5 w-full">
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-label="Booking" />
          ) : (
            <>
              {deposit > 0 ? `Pay ${money(deposit)} deposit & book` : "Book my appointment"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        {deposit > 0 && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            Secure checkout by Square. The {money(deposit)} holds your spot and comes off your
            total. Deposits are non-refundable — need a different time? Call {site.business.phone}.
          </p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Prices are for the vehicle size you pick. If the car turns out to be different, we'll
          confirm with you before starting.
        </p>
      </aside>
    </form>
  );
}

function Section({
  n,
  title,
  id,
  error,
  optional,
  children,
}: {
  n: number;
  title: string;
  id: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="panel scroll-mt-28 p-5 sm:p-6" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="flex items-center gap-3 font-display text-lg">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line-strong text-sm">
          {n}
        </span>
        {title}
        {optional && <span className="text-sm font-normal text-muted-foreground">(optional)</span>}
      </h2>
      <div className="mt-5">{children}</div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value ?? "—"}</dd>
    </div>
  );
}
