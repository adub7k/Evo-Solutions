/**
 * Evo Solutions — business facts.
 *
 * RULE FOR THIS FILE: everything here is published to a live commercial site.
 * A claim goes in only when it is verifiable. Anything Angelo still has to
 * confirm lives in `unverified` below, is NOT rendered by any component, and
 * is tracked in VERIFY.md. Inventing warranties, certifications, film brands,
 * heat-rejection percentages or review counts is an FTC problem and a Google
 * structured-data penalty — not a copywriting shortcut.
 */

export type ServiceKey = "tint" | "ceramic" | "ppf" | "detail" | "commercial";

export const site = {
  business: {
    name: "Evo Solutions",
    /** Angelo's own tagline, from the ShopFlow profile. */
    tagline: "Walk-ins welcome.",
    /** The shop traded as MAD Detailing NM before the 2026 rebrand. Same
     *  owner, same crew, same Google profile — so the reviews predate the
     *  name. We say so plainly rather than hiding it. */
    formerName: "MAD Detailing NM",
    phone: "(505) 420-5747",
    phoneHref: "tel:+15054205747",
    phoneDigits: "5054205747",
    email: "Angelo@evosolution.org",
    emailHref: "mailto:Angelo@evosolution.org",
    address: "3500 Vista Alameda NE, Suite A, Albuquerque, NM 87113",
    addressParts: {
      street: "3500 Vista Alameda NE, Suite A",
      city: "Albuquerque",
      state: "NM",
      zip: "87113",
      country: "US",
    },
    /** Used for the map embed + directions link. */
    mapsQuery: "Evo Solutions, 3500 Vista Alameda NE Suite A, Albuquerque, NM 87113",
    hours: [
      { day: "Monday – Saturday", value: "10:00 AM – 6:00 PM", open: true },
      { day: "Sunday", value: "Closed", open: false },
    ],
    /** Machine-readable hours for LocalBusiness schema. */
    hoursSchema: [
      {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
  },

  /** Canonical origin — used for canonical tags, OG URLs and the sitemap. */
  url: "https://www.evosolution.org",

  /**
   * Google Business Profile. Rating and count were read off the live profile
   * on 2026-07-08, before the MAD Detailing → Evo Solutions rename carried the
   * reviews over. Review counts drift, so this is re-checked at each launch —
   * see VERIFY.md. `aggregateRating` schema is emitted ONLY from these numbers.
   */
  reviews: {
    rating: 5.0,
    count: 18,
    verifiedOn: "2026-07-08",
    /** A search URL works without the Place ID; swap for the direct
     *  "write a review" link once Angelo sends it (VERIFY.md). */
    profileUrl: "https://www.google.com/search?q=Evo+Solutions+window+tint+Albuquerque+reviews",
  },

  /**
   * Areas Evo actually serves. Albuquerque metro only — we do NOT list Santa
   * Fe, Rio Rancho satellite pages or any other city the shop hasn't
   * confirmed it covers. Fabricated service areas are the classic local-SEO
   * spam signal.
   */
  /**
   * Film brands actually installed — confirmed by Angelo 2026-08-20.
   * (The previous site listed XPEL / 3M / SunTek / LLumar / Solar Gard /
   * Rayno, none of which the shop carries.)
   */
  filmBrands: ["HiTek", "Impressive Films"],

  serviceArea: {
    primary: "Albuquerque, New Mexico",
    /** Confirmed by Angelo as within normal travel for commercial work. */
    nearby: ["Rio Rancho", "Corrales", "Bernalillo", "Los Lunas"],
    note: "Vehicle work is done at the Albuquerque shop. Commercial and home glass is installed on site across the metro.",
  },

  social: {
    /** Only links Angelo has confirmed appear in the footer; empty = hidden. */
    instagram: "",
    facebook: "",
    youtube: "",
  },

  /**
   * ============================ NOT PUBLISHED ============================
   * Every item below is a claim the previous version of this site made
   * without a source. Nothing here is rendered anywhere. Each is listed in
   * VERIFY.md with the exact place it will slot into once Angelo confirms it.
   * Flip a value into the published config above only with a source.
   */
  unverified: {
    /** Site promised a "transferable lifetime manufacturer warranty" on every
     *  install and a "10-year" PPF warranty. No warranty document seen. */
    warranty: { tint: null, ppf: null, coating: null },
    /** Site claimed "certified installers" / "factory-trained". */
    certifications: null,
    /** Site claimed a "climate-controlled, dust-free bay". */
    facilityClaims: null,
    /** Site published "96% / 88% / 62%" heat-rejection and "99% UV" figures
     *  with no film spec sheet behind them. */
    heatRejectionFigures: null,
    /** Site advertised tint at $249/$299/$399/$549 — invented, and ~30% under
     *  Angelo's real prices. Pricing is now read LIVE from ShopFlow → Settings
     *  → Services (see src/lib/pricing.ts), so it can never drift again. */
    publishedPricing: null,
    /** Turnaround times ("2-3 hours", "same-day") were never sourced. */
    turnaroundTimes: null,
  },
};

/** Trust-bar items. `verified` gates rendering — unverified never paints. */
export type TrustSignal = {
  id: string;
  value: string;
  label: string;
  verified: boolean;
};

export const trustSignals: TrustSignal[] = [
  { id: "rating", value: "5.0★", label: `${site.reviews.count} Google reviews`, verified: true },
  { id: "local", value: "Albuquerque", label: "Locally owned & operated", verified: true },
  { id: "services", value: "Tint · PPF · Coating", label: "All done in-house", verified: true },
  { id: "walkins", value: "Walk-ins", label: "Welcome Mon–Sat", verified: true },
  // --- held back pending verification (see VERIFY.md) ---
  { id: "warranty", value: "Lifetime", label: "Film warranty", verified: false },
  { id: "certified", value: "Certified", label: "Factory-trained installers", verified: false },
];

export const publishedTrustSignals = trustSignals.filter((t) => t.verified);

export type Site = typeof site;
