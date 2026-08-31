/**
 * Live pricing, straight from ShopFlow → Settings → Services.
 *
 * Prices are NEVER hardcoded in this repo. Angelo sets them once in ShopFlow
 * (where they already drive booking and deposits) and the website reads the
 * same numbers, so the site can't drift out of sync with what he actually
 * charges — which is exactly what went wrong with the old hardcoded tiers.
 *
 * If the API is unreachable, every pricing block renders nothing and the page
 * falls back to its quote messaging. A missing price is fine; a wrong one is not.
 */

import { useEffect, useState } from "react";
import { publicApi } from "@/config/shopflow";

export type SizePrice = { key: string; label: string; amount: number };

export type PriceRow = {
  id: string;
  name: string;
  /** Per-vehicle-size pricing, when the service is priced by size. */
  sizes: SizePrice[] | null;
  /** Single price when the service isn't size-dependent. */
  flat: number | null;
  /** Scheduled duration in minutes, when set. */
  duration: number | null;
};

export type AddOn = { id: string; name: string; price: number };

export type Pricing = {
  /** Rows grouped by the site's service slug. */
  rows: Record<string, PriceRow[]>;
  addons: Record<string, AddOn[]>;
  deposit: { enabled: boolean; amount: number; message: string } | null;
};

/**
 * ShopFlow service categories → the site's service pages. Angelo's tenant uses
 * "exterior" for PPF because the category list predates the film side.
 */
const CATEGORY_TO_SLUG: Record<string, string> = {
  tint: "window-tint",
  detail: "auto-detailing",
  coating: "ceramic-coating",
  exterior: "paint-protection-film",
  ppf: "paint-protection-film",
};

/**
 * Add-ons carry no category in ShopFlow, so they're matched on name. An add-on
 * that matches nothing simply isn't shown — better a missing extra than one
 * listed under the wrong service. (VERIFY.md tells Angelo how to name them.)
 */
const ADDON_MATCHERS: [RegExp, string][] = [
  [/windshield|sun\s*roof|moon\s*roof|tint/i, "window-tint"],
  [/pet hair|interior|carpet|shampoo|odou?r|detail/i, "auto-detailing"],
  [/coating|ceramic coat/i, "ceramic-coating"],
  [/ppf|paint protection|clear bra/i, "paint-protection-film"],
];

let pricingPromise: Promise<Pricing | null> | null = null;

export function fetchPricing(): Promise<Pricing | null> {
  if (!pricingPromise) {
    pricingPromise = fetch(publicApi("/info"))
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then(normalize)
      .catch(() => null);
  }
  return pricingPromise;
}

/**
 * ShopFlow names are typed for the booking screen ("Windshield Tint -- Carbon",
 * "Ceramic Coating - Base"). Tidy the ASCII separators for display only — the
 * words themselves are left exactly as Angelo wrote them.
 */
const tidyName = (n: string) => n.replace(/\s+-{1,2}\s+/g, " — ").trim();

function normalize(info: Record<string, unknown>): Pricing {
  const sizes = Array.isArray(info.vehicleSizes)
    ? (info.vehicleSizes as { key: string; label: string }[])
    : [];
  const services = Array.isArray(info.services) ? (info.services as Record<string, unknown>[]) : [];
  const addonList = Array.isArray(info.addons) ? (info.addons as Record<string, unknown>[]) : [];

  const rows: Record<string, PriceRow[]> = {};
  for (const s of services) {
    const slug = CATEGORY_TO_SLUG[String(s.category ?? "").toLowerCase()];
    if (!slug) continue;
    const sizePricing = s.sizePricing as Record<string, number> | null | undefined;
    const priced =
      sizePricing && typeof sizePricing === "object"
        ? sizes
            .map((sz) => ({ key: sz.key, label: sz.label, amount: Number(sizePricing[sz.key]) }))
            .filter((p) => Number.isFinite(p.amount) && p.amount > 0)
        : [];

    const base = Number(s.price);
    if (!priced.length && !(Number.isFinite(base) && base > 0)) continue;

    (rows[slug] ??= []).push({
      id: String(s.id),
      name: tidyName(String(s.name)),
      sizes: priced.length ? priced : null,
      flat: priced.length ? null : base,
      duration: Number.isFinite(Number(s.duration)) ? Number(s.duration) : null,
    });
  }

  // Full-vehicle services first, then partial/flat-rate extras — otherwise a
  // cheap partial job ("front 2 windows, $170") leads the table and reads as
  // the price of a whole car. Cheapest first within each group.
  for (const list of Object.values(rows)) {
    list.sort((a, b) => {
      const aPartial = a.sizes ? 0 : 1;
      const bPartial = b.sizes ? 0 : 1;
      if (aPartial !== bPartial) return aPartial - bPartial;
      return lowestOf(a) - lowestOf(b);
    });
  }

  const addons: Record<string, AddOn[]> = {};
  for (const a of addonList) {
    const name = String(a.name ?? "");
    const price = Number(a.price);
    if (!name || !Number.isFinite(price) || price <= 0) continue;
    const match = ADDON_MATCHERS.find(([re]) => re.test(name));
    if (!match) continue;
    (addons[match[1]] ??= []).push({ id: String(a.id ?? name), name: tidyName(name), price });
  }

  const dep = info.deposit as { enabled?: boolean; amount?: number; message?: string } | undefined;

  return {
    rows,
    addons,
    deposit:
      dep && dep.enabled && Number(dep.amount) > 0
        ? {
            enabled: true,
            amount: Number(dep.amount),
            message: String(dep.message ?? ""),
          }
        : null,
  };
}

export function lowestOf(row: PriceRow): number {
  if (row.flat != null) return row.flat;
  return Math.min(...(row.sizes ?? []).map((s) => s.amount));
}

/**
 * "from $X" for the homepage cards.
 *
 * Deliberately ignores partial/flat-rate extras when a full-vehicle price
 * exists: window tint has a $170 "front 2 windows" line, and advertising
 * "Window Tint from $170" would set an expectation the $425 full-car price
 * doesn't meet. A from-price has to be the cheapest way to buy the whole
 * service, not the cheapest line item.
 */
export function startingAt(pricing: Pricing | null, slug: string): number | null {
  const list = pricing?.rows[slug];
  if (!list?.length) return null;
  const full = list.filter((r) => r.sizes);
  const source = full.length ? full : list;
  return Math.min(...source.map(lowestOf));
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * The tint landing page's film-tier axis: chip / anchor key → matcher against
 * ShopFlow service names ("Window Tint -- Ceramic" etc.). The vehicle axis is
 * ShopFlow's own per-size pricing, so both axes stay owner-edited in ShopFlow.
 * Adjust the matchers here — never the page logic — if Angelo renames services.
 */
export const TINT_TIER_MATCH = {
  ceramic: /ceramic/i,
  carbon: /carbon/i,
} as const;

export type TintTier = keyof typeof TINT_TIER_MATCH;

/**
 * Live full-vehicle price range for a film tier (or across both tiers when
 * the visitor hasn't picked one). Same source and same rules as startingAt():
 * full-vehicle rows only, and null — render nothing — when the API is down.
 */
export function tintTierRange(
  pricing: Pricing | null,
  tier: TintTier | null,
): { min: number; max: number } | null {
  const rows = (pricing?.rows["window-tint"] ?? []).filter(
    (r) => r.sizes && (tier ? TINT_TIER_MATCH[tier].test(r.name) : true),
  );
  const amounts = rows.flatMap((r) => (r.sizes ?? []).map((s) => s.amount));
  if (!amounts.length) return null;
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

export function usePricing(): Pricing | null {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  useEffect(() => {
    let alive = true;
    fetchPricing().then((p) => alive && setPricing(p));
    return () => {
      alive = false;
    };
  }, []);
  return pricing;
}
