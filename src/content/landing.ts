/**
 * Paid landing page variants.
 *
 * /tint and /ppf share one form component (LandingLeadForm) and one page
 * skeleton, but they are not the same pitch: a tint buyer chooses a film tier
 * and a PPF buyer chooses how much of the car to cover. Everything that
 * differs between the two forms lives here as data, so the form's submit,
 * validation, tracking and success logic stays in one place and can't drift.
 *
 * Copy rules inherited from the rest of the site: no prices typed here (they
 * come live from ShopFlow via lib/pricing.ts), no warranty or performance
 * figure that isn't in `site.*Specs` with a source.
 */

import { site } from "@/config/site";
import { serviceBySlug } from "@/content/services";
import { ppfRange, tintTierRange, type Pricing, type TintTier } from "@/lib/pricing";

export type Vehicle = { year: string; make: string; model: string };
export type Estimate = { label: string; min: number; max: number };

export type LandingVariant = {
  key: "tint" | "ppf";
  /** Human label for the lead's notes ("Window Tint"). */
  service: string;
  /** Must match the shop's ShopFlow lead-form option character for character. */
  leadValue: string;
  /** Goes into the lead notes so the CRM shows which page produced it. */
  sourceLine: string;
  form: {
    heading: string;
    intro: string;
    /** Short trust facts under the intro; the first gets the shield icon. */
    trust: string[];
    cta: string;
    phoneHint: string;
  };
  /** The one qualifying choice: film tier on /tint, coverage on /ppf. */
  choice: {
    legend: string;
    hint?: string;
    options: readonly string[];
    initial: string;
    /** Label in the lead notes ("Film tier: …"). */
    noteLabel: string;
    /** generate_lead parameter name so ad platforms can optimise on it. */
    param: string;
  };
  /** The "what's bothering you" chips — optional, never required. */
  concern: { legend: string; options: readonly string[] };
  /** Render the choice chips above the concern chips. */
  choiceFirst: boolean;
  /** Live estimate for the success screen; null = show no estimate block. */
  estimate: (pricing: Pricing | null, choice: string) => Estimate | null;
  estimateNote: (choice: string, v: Vehicle) => string;
  successNote: (choice: string, v: Vehicle) => string;
};

/** Chip text → anchor/preset key: "Full front — …" → "full-front-…". */
export const optionKey = (o: string) => o.toLowerCase().replace(/\W+/g, "-");

/* ================================================================== tint == */

const TINT = serviceBySlug("window-tint");
const tintSpecs = site.tintSpecs;

/** The tier chips carry the numbers, so choosing one is itself the pitch. */
const TINT_TIERS = [
  `Ceramic — ${tintSpecs.ceramic.heat}% heat`,
  `Carbon — ${tintSpecs.carbon.heat}% heat`,
  "Not sure — recommend one",
] as const;

/**
 * Success-screen estimate lookup. Both axes stay owner-edited in ShopFlow:
 * the vehicle axis is ShopFlow's own per-size pricing and the film-tier axis
 * is the TINT_TIER_MATCH matcher map in lib/pricing.ts.
 */
const chipTier = (chip: string): TintTier | null =>
  chip.startsWith("Ceramic") ? "ceramic" : chip.startsWith("Carbon") ? "carbon" : null;

export const tintLanding: LandingVariant = {
  key: "tint",
  service: "Window Tint",
  leadValue: TINT?.leadValue ?? "Window tint",
  sourceLine: "Source: tint landing page (paid social)",
  form: {
    heading: "Get your tint price",
    intro:
      "Tell us the car and what's bothering you. We'll text back a shade recommendation and a flat number — no deposit, no obligation.",
    trust: [
      tintSpecs.warranty,
      `${tintSpecs.ceramic.uv}% UV blocked`,
      `Up to ${tintSpecs.ceramic.heat}% heat rejected`,
    ],
    cta: "Get My Tint Price",
    phoneHint: "We'll text your price here.",
  },
  choice: {
    legend: "Film",
    hint: `Both block ${tintSpecs.ceramic.uv}% of UV and never purple. The difference is heat — ${tintSpecs.carbon.heat}% vs ${tintSpecs.ceramic.heat}%.`,
    options: TINT_TIERS,
    initial: "Not sure — recommend one",
    noteLabel: "Film tier",
    param: "film_tier",
  },
  concern: {
    legend: "What's bothering you?",
    /** Trimmed from the tint page's goal list — four reads faster than six. */
    options: [
      "Heat — the car bakes",
      "Glare on my commute",
      "Privacy / security",
      "Looks",
      "Removing old tint",
    ],
  },
  choiceFirst: false,
  estimate: (pricing, choice) => {
    const tier = chipTier(choice);
    const range = tintTierRange(pricing, tier);
    if (!range) return null;
    return { label: `Estimated price — full vehicle, ${tier ?? "carbon or ceramic"}`, ...range };
  },
  estimateNote: (_choice, v) =>
    `Estimate only, pending final confirmation — where your ${v.make} ${v.model} lands depends on its size and glass.`,
  successNote: (_choice, v) =>
    `We'll text your exact flat price for the ${v.year} ${v.make} ${v.model} — usually the same day during shop hours.`,
};

/* =================================================================== ppf == */

const PPF = serviceBySlug("paint-protection-film");

/**
 * Coverage chips. Short on purpose — they're pills — with the panel list in
 * the hint. The keys (optionKey) double as the /ppf#… arrival anchors:
 * partial-front, full-front, extended, full-body.
 */
export const PPF_COVERAGE = [
  "Partial front",
  "Full front",
  "Extended / track",
  "Full body",
  "Not sure — recommend coverage",
] as const;

/** Coverage the live "PPF" row in ShopFlow prices; everything else is per-car. */
const standardCoverage = (choice: string) =>
  choice.startsWith("Partial") || choice.startsWith("Full front") || choice.startsWith("Not sure");

export const ppfLanding: LandingVariant = {
  key: "ppf",
  service: "Paint Protection Film",
  leadValue: PPF?.leadValue ?? "PPF",
  sourceLine: "Source: PPF landing page (paid search)",
  form: {
    heading: "Get your PPF price",
    intro:
      "Tell us the car and how you drive it. We'll text back the coverage we'd actually recommend and a flat number — no deposit, no obligation.",
    trust: ["Self-healing film", `${site.filmBrands.join(" & ")} film`, "Installed in our own bay"],
    cta: "Get My PPF Price",
    phoneHint: "We'll text your price here.",
  },
  choice: {
    legend: "Coverage",
    hint: "Partial front is the bumper, hood edge and mirrors. Full front adds the whole hood and both fenders — no line across the hood.",
    options: PPF_COVERAGE,
    initial: "Not sure — recommend coverage",
    noteLabel: "Coverage",
    param: "coverage",
  },
  concern: {
    legend: "What are you protecting against?",
    options: [
      "Highway gravel — I-25 / I-40 commute",
      "Brand-new car — keep it factory",
      "Dark paint that shows every chip",
      "Already have chips",
      "Leased — has to come off clean",
    ],
  },
  choiceFirst: true,
  estimate: (pricing, choice) => {
    if (!standardCoverage(choice)) return null;
    const range = ppfRange(pricing);
    if (!range) return null;
    return { label: "Estimated price — standard front coverage", ...range };
  },
  estimateNote: (_choice, v) =>
    `Estimate only, pending final confirmation — where your ${v.make} ${v.model} lands depends on its size, and any existing chips are worth addressing before film goes on.`,
  successNote: (choice, v) =>
    standardCoverage(choice)
      ? `We'll text your exact flat price for the ${v.year} ${v.make} ${v.model} — usually the same day during shop hours.`
      : `Extended and full-body coverage is quoted per car. We'll text the number for your ${v.year} ${v.make} ${v.model} — usually the same day during shop hours.`,
};

/** Where damage lands, in order of how often we see it. Used on both PPF pages. */
export const ppfImpactZones = [
  { zone: "Front bumper", note: "Takes the most, by a wide margin." },
  { zone: "Leading edge of the hood", note: "Catches almost everything that clears the bumper." },
  { zone: "Mirrors", note: "Small, exposed, and expensive to repaint." },
  { zone: "Headlights", note: "Sandblasting hazes the lens — a safety issue, not just cosmetic." },
  { zone: "A-pillars & roof edge", note: "Highway miles at speed." },
  { zone: "Rockers & behind the wheels", note: "Everything the front tyres throw backwards." },
];
