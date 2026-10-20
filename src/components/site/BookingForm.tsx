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
  conflicts,
  covers,
  depositCheckout,
  bookableDays,
  BOOKING_GROUPS,
  durationFor,
  durationRangeLabel,
  fetchBookingMenu,
  fetchSlots,
  formatBookingDate,
  fromPrice,
  groupAddons,
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

export type BookingFormProps = {
  /** Preselects a service by its name key ("gold-detail"); prefix match. */
  preset?: string;
  /** Bump to re-apply the same preset (a package card tapped twice). */
  presetKey?: number;
  /**
   * Site service slugs this form books. Defaults to the owner's /book list
   * (site.booking.services); the /detail ad page passes ["auto-detailing"].
   */
  services?: readonly string[];
  /** The "looking for something else?" line under the service cards. */
  quoteNote?: React.ReactNode;
};

export function BookingForm({ preset, presetKey, services, quoteNote }: BookingFormProps) {
  const [menu, setMenu] = useState<BookingMenu | null | undefined>(undefined);
  const list = services ?? site.booking.services;
  const listKey = list.join(",");
  useEffect(() => {
    captureAttribution();
    let alive = true;
    fetchBookingMenu(listKey.split(",")).then((m) => alive && setMenu(m));
    return () => {
      alive = false;
    };
  }, [listKey]);

  if (menu === undefined) {
    return (
      <div className="panel grid min-h-[22rem] place-items-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading booking" />
      </div>
    );
  }
  if (!menu) return <BookingUnavailable />;
  return (
    <BookingStages
      menu={menu}
      preset={preset}
      presetKey={presetKey}
      services={list}
      quoteNote={quoteNote}
    />
  );
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

function BookingStages({
  menu,
  preset,
  presetKey = 0,
  services,
  quoteNote,
}: {
  menu: BookingMenu;
  preset?: string;
  presetKey?: number;
  services: readonly string[];
  quoteNote?: React.ReactNode;
}) {
  const id = useId();
  const navigate = useNavigate();

  // Several services can share one visit (e.g. front 2 windows + windshield);
  // conflicting picks replace each other — see conflicts() in lib/booking.
  const presetHit = (key?: string) =>
    key ? menu.services.find((s) => optionKey(s.name).startsWith(key)) : undefined;
  const [serviceIds, setServiceIds] = useState<string[]>(() => {
    const hit = presetHit(preset);
    return hit ? [hit.id] : [];
  });
  // A preset is an explicit choice (an arrival hash, or a package card tapped
  // on the page), so a later one replaces whatever was picked — and the key
  // bump means tapping the same card twice still re-applies it.
  useEffect(() => {
    const hit = presetHit(preset);
    if (hit) setServiceIds([hit.id]);
    // presetHit only depends on the menu, which is stable for this instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, presetKey]);
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

  const selected = menu.services.filter((s) => serviceIds.includes(s.id));
  // The visit as a whole: what the summary, slots and copy talk about.
  const service = selected.length
    ? {
        name: selected.map((s) => s.name).join(" + "),
        slug: selected[0].slug,
        sizes: selected.some((s) => s.sizes),
        // Per-size length once a size is picked (a truck detail runs hours
        // longer than a sedan's); the flat figure until then.
        duration: selected.reduce((t, s) => t + durationFor(s, sizeKey), 0),
      }
    : null;
  const extras = selected
    .flatMap((s) => addonsFor(menu, s))
    .filter((a, i, all) => all.findIndex((b) => b.id === a.id) === i)
    .filter((a) => !selected.some((sv) => covers(sv, a)));
  const chosenExtras = extras.filter((a) => addonIds.includes(a.id));
  const sumFor = (size: string | null) => {
    const prices = selected.map((s) => priceFor(s, size));
    return prices.some((p) => p == null) ? null : prices.reduce<number>((t, p) => t + (p ?? 0), 0);
  };
  const base = service ? sumFor(sizeKey) : null;
  const total = base == null ? null : base + chosenExtras.reduce((t, a) => t + a.price, 0);
  const deposit = menu.deposit?.amount ?? 0;
  const days = useMemo(() => bookableDays(menu), [menu]);
  // The size is part of the key only when it changes the job's length —
  // otherwise picking a size would refetch identical times for nothing.
  const sizeMatters = selected.some((s) => s.durations);
  const slotKey =
    date && service
      ? `${date}|${[...serviceIds].sort().join(",")}|${sizeMatters ? (sizeKey ?? "") : ""}`
      : null;
  const daySlots = slotKey ? slots[slotKey] : undefined;

  // Slots depend on the job's length, so they're fetched per (date, service, size).
  useEffect(() => {
    if (!slotKey || slotKey in slots) return;
    const [d, ids, size] = slotKey.split("|");
    let alive = true;
    fetchSlots(d, ids.split(","), size || null).then(
      (list) => alive && setSlots((m) => ({ ...m, [slotKey]: list })),
    );
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
    const next = serviceIds.includes(s.id)
      ? serviceIds.filter((x) => x !== s.id)
      : [
          ...serviceIds.filter((x) => {
            const other = menu.services.find((o) => o.id === x);
            return other && !conflicts(other, s);
          }),
          s.id,
        ];
    setServiceIds(next);
    const picked = menu.services.filter((o) => next.includes(o.id));
    const allowed = new Set(
      picked
        .flatMap((o) => addonsFor(menu, o))
        .filter((a) => !picked.some((o) => covers(o, a)))
        .map((a) => a.id),
    );
    setAddonIds((ids) => ids.filter((x) => allowed.has(x)));
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
    const sig = JSON.stringify([serviceIds, sizeKey, addonIds, date, time, form]);
    const res: BookResult =
      unpaid && unpaid.sig === sig
        ? await depositCheckout(unpaid.id).then((url) =>
            url
              ? { ok: true as const, appointmentId: unpaid.id, checkoutUrl: url }
              : { ok: false as const, error: "deposit", appointmentId: unpaid.id },
          )
        : await book(
            {
              services: selected,
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

  const groups = services.filter((slug) => menu.services.some((s) => s.slug === slug));

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10"
    >
      <div className="min-w-0 space-y-6">
        {/* 1 — service */}
        <Section n={1} title="What are we doing?" id={`${id}-sec-service`} error={errors.service}>
          <p className="-mt-2 mb-5 text-sm text-muted-foreground">
            Pick one or more — they're done in the same visit.
          </p>
          <div className="space-y-6">
            {groups.map((slug) => (
              <div key={slug}>
                <p className="eyebrow mb-3">{BOOKING_GROUPS[slug] ?? slug}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {menu.services
                    .filter((s) => s.slug === slug)
                    .map((s) => {
                      const active = serviceIds.includes(s.id);
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
                            {sizeKey && s.durations
                              ? hoursLabel(durationFor(s, sizeKey))
                              : durationRangeLabel(s)}
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
            {quoteNote ?? (
              <>
                Looking for PPF, ceramic coating, detailing or something custom?{" "}
                <Link
                  to="/quote"
                  onClick={() => trackQuoteClick("book-page")}
                  className="text-accent underline underline-offset-4"
                >
                  Get a free quote
                </Link>{" "}
                instead.
              </>
            )}
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
                  const p = service?.sizes ? sumFor(sz.key) : null;
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
            {/* Grouped under the owner's own headings (Interior / Exterior)
                when ShopFlow has them; a single ungrouped grid otherwise. */}
            <div className="space-y-5">
              {groupAddons(extras).map((g) => (
                <div key={g.group || "_"}>
                  {g.group && <p className="eyebrow mb-2.5">{g.group}</p>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {g.items.map((a) => {
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
                </div>
              ))}
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
          {selected.length === 0 && <Row label="Service" />}
          {selected.map((sv) => {
            const p = priceFor(sv, sizeKey);
            return <Row key={sv.id} label={sv.name} value={p != null ? money(p) : "pick a size"} />;
          })}
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
