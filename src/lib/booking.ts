/**
 * Online booking + deposit, through the ShopFlow public API.
 *
 *   GET  /info                         — services, sizes, add-ons, staff hours, deposit
 *   GET  /availability?date&serviceId  — start times where the WHOLE job fits
 *   POST /book                         — creates the appointment (pending-deposit)
 *   POST /square-deposit-session       — hosted Square checkout for the deposit;
 *                                        Square sends the customer back to
 *                                        /book/confirmed?booking=…&status=…
 *
 * This is the one place on the site that shows prices (site.booking). It reads
 * /info itself rather than going through lib/pricing's fetchPricing(), which is
 * switched off by `site.publishPrices`. Everything money-related is decided by
 * ShopFlow: the price of the job, the deposit amount, and whether the slot is
 * still free — the browser only ever asks.
 */

import { publicApi } from "@/config/shopflow";
import { site } from "@/config/site";
import { ADDON_MATCHERS, CATEGORY_TO_SLUG, tidyName } from "@/lib/pricing";
import { getAttributionLines } from "@/lib/leads";

export type BookableService = {
  id: string;
  /** Display name ("Ceramic Tint"). */
  name: string;
  /** Site service slug ("window-tint"). */
  slug: string;
  /** Per-size price, keyed by ShopFlow size key; null = flat price. */
  sizes: Record<string, number> | null;
  flat: number | null;
  /** Minutes. */
  duration: number;
};

export type BookingAddOn = { id: string; name: string; price: number; slug: string };

export type BookingMenu = {
  services: BookableService[];
  sizes: { key: string; label: string }[];
  addons: BookingAddOn[];
  /** Weekdays (0 = Sunday) anyone on staff works. */
  workDays: number[];
  blockedDates: string[];
  /** null = the shop takes no deposit (booking confirms straight away). */
  deposit: { amount: number } | null;
};

/** Service groups shown on the page, in order. */
export const BOOKING_GROUPS: Record<string, string> = {
  "window-tint": "Window tint",
  "auto-detailing": "Detailing",
  "paint-protection-film": "Paint protection film",
  "ceramic-coating": "Ceramic coating",
};

let menuPromise: Promise<BookingMenu | null> | null = null;

export function fetchBookingMenu(): Promise<BookingMenu | null> {
  if (!site.booking.enabled) return Promise.resolve(null);
  if (!menuPromise) {
    menuPromise = fetch(publicApi("/info"))
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(toMenu)
      .catch(() => {
        menuPromise = null; // let a retry try again
        return null;
      });
  }
  return menuPromise;
}

function toMenu(info: Record<string, unknown>): BookingMenu | null {
  if (info.bookingEnabled === false) return null;
  const allowed = new Set(site.booking.services);
  const sizes = Array.isArray(info.vehicleSizes)
    ? (info.vehicleSizes as { key: string; label: string }[]).map((s) => ({
        key: s.key,
        label: s.label,
      }))
    : [];

  const services: BookableService[] = [];
  for (const raw of (info.services as Record<string, unknown>[]) ?? []) {
    const slug = CATEGORY_TO_SLUG[String(raw.category ?? "").toLowerCase()];
    if (!slug || !allowed.has(slug)) continue;
    const sp = raw.sizePricing as Record<string, unknown> | null | undefined;
    const sized: Record<string, number> = {};
    if (sp && typeof sp === "object") {
      for (const sz of sizes) {
        const n = Number(sp[sz.key]);
        if (Number.isFinite(n) && n > 0) sized[sz.key] = n;
      }
    }
    const flat = Number(raw.price);
    const hasSizes = Object.keys(sized).length > 0;
    if (!hasSizes && !(Number.isFinite(flat) && flat > 0)) continue; // unpriced → not bookable
    services.push({
      id: String(raw.id),
      name: tidyName(String(raw.name)),
      slug,
      sizes: hasSizes ? sized : null,
      flat: hasSizes ? null : flat,
      duration: Number(raw.duration) || 60,
    });
  }
  // Full-vehicle jobs first, then partials, cheapest first — same rule as the
  // pricing tables, so "Front 2 windows" never reads as the price of a car.
  services.sort((a, b) => {
    if (a.slug !== b.slug)
      return site.booking.services.indexOf(a.slug) - site.booking.services.indexOf(b.slug);
    if (!!a.sizes !== !!b.sizes) return a.sizes ? -1 : 1;
    return fromPrice(a) - fromPrice(b);
  });

  const addons: BookingAddOn[] = [];
  for (const a of (info.addons as Record<string, unknown>[]) ?? []) {
    const name = String(a.name ?? "");
    const price = Number(a.price);
    const match = ADDON_MATCHERS.find(([re]) => re.test(name));
    if (!name || !match || !(price > 0) || !allowed.has(match[1])) continue;
    addons.push({ id: String(a.id), name: tidyName(name), price, slug: match[1] });
  }

  const workDays = new Set<number>();
  for (const b of (info.barbers as { schedule?: { workDays?: number[] } }[]) ?? []) {
    for (const d of b.schedule?.workDays ?? [1, 2, 3, 4, 5, 6]) workDays.add(d);
  }

  const dep = info.deposit as { enabled?: boolean; amount?: number } | undefined;
  // Online deposits run through Square only; a shop on another processor
  // books without one rather than sending customers to a checkout we can't verify.
  const deposit =
    dep?.enabled && Number(dep.amount) > 0 && info.depositProvider === "square"
      ? { amount: Number(dep.amount) }
      : null;

  if (!services.length) return null;
  return {
    services,
    sizes,
    addons,
    workDays: [...workDays],
    blockedDates: Array.isArray(info.blockedDates) ? (info.blockedDates as string[]) : [],
    deposit,
  };
}

export function fromPrice(s: BookableService): number {
  return s.flat ?? Math.min(...Object.values(s.sizes ?? {}));
}

/** Price of a service for a vehicle size (null until a size is chosen). */
export function priceFor(s: BookableService, sizeKey: string | null): number | null {
  if (s.flat != null) return s.flat;
  if (!sizeKey) return null;
  return s.sizes?.[sizeKey] ?? null;
}

/**
 * Add-ons that make sense with a service: same site slug, and for tint the
 * same film (no ceramic windshield on a carbon job, and vice versa).
 */
export function addonsFor(menu: BookingMenu, s: BookableService): BookingAddOn[] {
  const film = /ceramic/i.test(s.name) ? "ceramic" : /carbon/i.test(s.name) ? "carbon" : null;
  return menu.addons.filter((a) => {
    if (a.slug !== s.slug) return false;
    if (!film) return true;
    const aFilm = /ceramic/i.test(a.name) ? "ceramic" : /carbon/i.test(a.name) ? "carbon" : null;
    return !aFilm || aFilm === film;
  });
}

const longFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
export const formatBookingDate = (iso: string) => longFmt.format(new Date(iso + "T12:00:00"));

export function hoursLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  return Number.isInteger(h) ? `about ${h} hr${h > 1 ? "s" : ""}` : `about ${h.toFixed(1)} hrs`;
}

/** Local YYYY-MM-DD (the shop and its customers share a timezone). */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The next `count` days the shop works (today included), skipping blocked dates. */
/** Earliest moment a job may start: now + site.booking.minNoticeHours. */
export function earliestStart(): Date {
  return new Date(Date.now() + site.booking.minNoticeHours * 3600 * 1000);
}

/**
 * The next `count` days the shop works, skipping blocked dates and any day
 * that ends before the minimum notice runs out (48 hours, owner call).
 */
export function bookableDays(menu: BookingMenu, count = 14): Date[] {
  const out: Date[] = [];
  const d = new Date(earliestStart());
  d.setHours(12, 0, 0, 0);
  for (let i = 0; out.length < count && i < 60; i++) {
    if (menu.workDays.includes(d.getDay()) && !menu.blockedDates.includes(isoDate(d))) {
      out.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/**
 * Open start times for a date, minus anything inside the minimum-notice
 * window (ShopFlow only knows dates, not "now", so the cut happens here).
 */
export async function fetchSlots(dateISO: string, serviceId: string): Promise<string[] | null> {
  try {
    const res = await fetch(
      publicApi(`/availability?date=${dateISO}&serviceId=${encodeURIComponent(serviceId)}`),
    );
    if (!res.ok) return null;
    const slots = await res.json();
    if (!Array.isArray(slots)) return null;
    const earliest = earliestStart().getTime();
    const day = new Date(dateISO + "T00:00:00");
    return slots.filter((t: string) => day.getTime() + clockMinutes(t) * 60000 >= earliest);
  } catch {
    return null;
  }
}

export function clockMinutes(t: string): number {
  const [tm, ap] = t.split(" ");
  const [hh, m] = tm.split(":").map(Number);
  let h = hh;
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/* ------------------------------------------------------------- booking -- */

export type BookingRequest = {
  service: BookableService;
  sizeKey: string | null;
  addonIds: string[];
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  vehicle: { year: string; make: string; model: string };
  notes: string;
};

/** What /book/confirmed needs to show — kept in sessionStorage across Square. */
export type BookingSummary = {
  id: string;
  service: string;
  serviceSlug: string;
  vehicle: string;
  addons: string[];
  date: string;
  time: string;
  total: number;
  deposit: number;
};

const SUMMARY_KEY = "evo_booking";

export function saveSummary(s: BookingSummary) {
  try {
    sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(s));
  } catch {
    /* private mode — the confirmation page still works from the URL */
  }
}

export function loadSummary(id: string | null): BookingSummary | null {
  try {
    const raw = sessionStorage.getItem(SUMMARY_KEY);
    const s = raw ? (JSON.parse(raw) as BookingSummary) : null;
    return s && (!id || s.id === id) ? s : null;
  } catch {
    return null;
  }
}

export type BookResult =
  | { ok: true; appointmentId: string; checkoutUrl: string | null }
  | { ok: false; error: string; slotTaken?: boolean; appointmentId?: string };

export async function book(req: BookingRequest, deposit: number | null): Promise<BookResult> {
  const notes = [
    "Booked online at evosolution.org",
    req.notes.trim() && `Customer note: ${req.notes.trim()}`,
    ...getAttributionLines(),
  ]
    .filter(Boolean)
    .join("\n");

  let appointmentId: string;
  try {
    const res = await fetch(publicApi("/book"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: req.name.trim(),
        customerPhone: req.phone.trim(),
        customerEmail: req.email.trim(),
        serviceId: req.service.id,
        vehicleSize: req.sizeKey,
        addons: req.addonIds,
        date: req.date,
        time: req.time,
        notes,
        source: "website",
        customFields: {
          vehicleYear: req.vehicle.year.trim(),
          vehicleMake: req.vehicle.make.trim(),
          vehicleModel: req.vehicle.model.trim(),
        },
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) {
      return { ok: false, error: body.error || "Booking failed", slotTaken: res.status === 409 };
    }
    appointmentId = body.appointmentId;
  } catch {
    return { ok: false, error: "network" };
  }

  if (!deposit) return { ok: true, appointmentId, checkoutUrl: null };
  const checkoutUrl = await depositCheckout(appointmentId);
  // The appointment exists (pending, NOT holding the slot) — hand its id back so
  // a retry reopens checkout for it instead of creating a duplicate.
  if (!checkoutUrl) return { ok: false, error: "deposit", appointmentId };
  return { ok: true, appointmentId, checkoutUrl };
}

/** Square hosted checkout for an existing pending booking (also used to retry). */
export async function depositCheckout(appointmentId: string): Promise<string | null> {
  try {
    const res = await fetch(publicApi("/square-deposit-session"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        returnUrl: `${window.location.origin}/book/confirmed`,
      }),
    });
    const body = await res.json().catch(() => ({}));
    return res.ok && body.ok && body.url ? String(body.url) : null;
  } catch {
    return null;
  }
}
