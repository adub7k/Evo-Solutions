/**
 * Portfolio curation for the shop's real photography.
 *
 * Every photo on this site comes from ShopFlow (Settings → Work Gallery), so
 * Angelo can add work without a deploy. Those uploads arrive with no caption
 * and no category, so this file supplies both for the photos currently on the
 * profile, keyed by the stable part of the upload filename.
 *
 * Precedence, highest first:
 *   1. A caption typed into ShopFlow (Angelo can correct anything from there)
 *   2. The curation below
 *   3. Nothing — the photo still shows, just without a label or a filter tag
 *
 * Captions describe what is visibly happening in the frame. Where the service
 * genuinely can't be told from the photo, `tag` is null so the shot appears
 * under "All work" rather than being filed under a service we guessed at.
 */

import type { GalleryTag } from "./services";

export type Curated = {
  /** Unique fragment of the ShopFlow upload filename. */
  match: string;
  caption: string;
  alt: string;
  tag: GalleryTag | null;
  /**
   * Photo is a phone screenshot with solid black bars top and bottom.
   * Measured: the bars are symmetric and the real content sits in the middle
   * 61.6% at a 3:4 ratio, so rendering these in a 3/4 frame with object-cover
   * trims the bars exactly. Angelo can drop the flag by re-uploading the
   * original photo instead of the screenshot (see VERIFY.md).
   */
  letterboxed?: boolean;
  /**
   * Intrinsic pixel size, measured from the actual upload. Used to reserve the
   * frame before the file arrives so the masonry never reflows — ShopFlow's API
   * doesn't return dimensions, so they're recorded here.
   */
  w?: number;
  h?: number;
};

export const curatedPhotos: Curated[] = [
  {
    match: "mshquoduxi9nd",
    w: 1024,
    h: 1280,
    caption: "Tint install — Toyota Camry",
    alt: "Evo Solutions installer squeegeeing window film onto the door glass of a blue Toyota Camry",
    tag: "tint",
  },
  {
    match: "mshqt5m5dl8ta",
    w: 590,
    h: 1280,
    letterboxed: true,
    caption: "Home window film — Albuquerque",
    alt: "Albuquerque home at dusk with solar control window film on the front elevation glass",
    tag: "commercial",
  },
  {
    match: "mshqt2llc5hj9",
    w: 590,
    h: 1280,
    letterboxed: true,
    caption: "Storefront glass — restaurant patio",
    alt: "Tinted storefront window wall on an Albuquerque restaurant patio",
    tag: "commercial",
  },
  {
    match: "mshqszd33ctae",
    w: 590,
    h: 1280,
    letterboxed: true,
    caption: "Interior glass wall — restaurant",
    alt: "Restaurant interior seen through a newly filmed glass partition wall",
    tag: "commercial",
  },
  {
    match: "mryafhikc31pp",
    w: 853,
    h: 1280,
    caption: "Audi RS3 — final wipe-down",
    alt: "Technician wiping down the rear quarter of a bright green Audi RS3 in the Evo Solutions bay",
    tag: "detail",
  },
  {
    match: "mryaf86b1j346",
    w: 1024,
    h: 1280,
    caption: "Audi RS3 — rear detail",
    alt: "Close-up of a technician finishing the rear decklid of a green Audi RS3",
    tag: "detail",
  },
  {
    match: "mryaf290k6m06",
    w: 853,
    h: 1280,
    caption: "Audi RS3 — door and rocker",
    alt: "Technician kneeling to finish the door and rocker panel of a green Audi RS3",
    tag: "detail",
  },
  {
    match: "mryaelkbzdvf1",
    w: 1280,
    h: 853,
    caption: "Audi RS3 — rear three-quarter",
    alt: "Green Audi RS3 with the trunk open being finished in the shop",
    tag: "detail",
  },
  {
    match: "mryad7l5tcxfh",
    w: 1024,
    h: 1280,
    caption: "Flat glass film going on",
    alt: "Installer laying window film onto a flat pane of glass in a door",
    tag: "commercial",
  },
  {
    match: "mryaao58tbiop",
    w: 1024,
    h: 1280,
    caption: "PPF — fender and headlight edge",
    alt: "Installer using a heat gun and squeegee to lay paint protection film around a fender arch",
    tag: "ppf",
  },
  {
    match: "mryaadujcwgw4",
    w: 1280,
    h: 720,
    caption: "Cadillac CT4-V — film prep",
    alt: "Technician spraying slip solution across the hood of a gold Cadillac CT4-V before film install",
    tag: "ppf",
  },
  {
    match: "mryaa4ujv0kjh",
    w: 1280,
    h: 720,
    caption: "Mercedes-AMG GLE 63",
    alt: "Technician finishing the front fender of a green Mercedes-AMG GLE 63 in the shop",
    tag: "detail",
  },
  {
    match: "mrya9yknya6pa",
    w: 1280,
    h: 720,
    caption: "Cadillac CT4-V — hood film",
    alt: "Three Evo Solutions technicians laying paint protection film across the hood of a gold Cadillac CT4-V",
    tag: "ppf",
  },
  {
    match: "mrya9r9wnqckl",
    w: 853,
    h: 1280,
    caption: "Windshield prep",
    alt: "Installer spraying and prepping the inside of a windshield before film goes on",
    tag: "tint",
  },
  {
    match: "mrya9h6hwfqr3",
    w: 1280,
    h: 720,
    caption: "Toyota Camry — tint finished",
    alt: "Blue Toyota Camry with finished window tint standing in the Evo Solutions install bay",
    tag: "tint",
  },
  {
    match: "mrya9cux4vbkp",
    w: 1280,
    h: 720,
    caption: "Cadillac CT5-V — paint correction",
    alt: "Technician machine-polishing the rear door of a black Cadillac CT5-V",
    tag: "detail",
  },
  {
    match: "mry2styz76daj",
    w: 1280,
    h: 853,
    caption: "Porsche 911 Turbo S",
    alt: "Dark blue Porsche 911 Turbo S finished and standing in the Evo Solutions bay",
    // Finished car — the photo alone doesn't show which service was done.
    tag: null,
  },
];

/**
 * A genuine progression on one car: the Camry with film going on, and the same
 * Camry finished. Not a staged before/after — just the two ends of one job.
 * True before/after pairs are a VERIFY.md item for Angelo to shoot.
 */
export const progression = {
  eyebrow: "One job, both ends",
  title: "What it looks like in the bay, and what you pick up.",
  body: "Same car, same afternoon. Film going onto the door glass, and the finished result before it went back to its owner.",
  beforeMatch: "mshquoduxi9nd",
  beforeLabel: "Film going on",
  afterMatch: "mrya9h6hwfqr3",
  afterLabel: "Finished",
};

/**
 * True before/after pairs — same vehicle, same angle, same framing.
 *
 * Empty on purpose. We don't have any yet, and pairing two unrelated photos
 * would be a staged comparison. The `BeforeAfter` slider renders as soon as
 * there's a real entry here; VERIFY.md tells Angelo what to shoot.
 */
export type BeforeAfterPair = {
  id: string;
  title: string;
  blurb: string;
  beforeMatch: string;
  afterMatch: string;
  tag: GalleryTag;
};

export const beforeAfterPairs: BeforeAfterPair[] = [];

export const galleryFilters: { key: GalleryTag | "all"; label: string }[] = [
  { key: "all", label: "All work" },
  { key: "tint", label: "Window Tint" },
  { key: "ppf", label: "PPF" },
  { key: "detail", label: "Detailing" },
  { key: "commercial", label: "Commercial & Home" },
];

/** Keyword → tag, so a caption typed in ShopFlow re-files a photo correctly. */
const CAPTION_TAGS: [RegExp, GalleryTag][] = [
  [/\bppf\b|paint protection|clear bra/i, "ppf"],
  [/ceramic coat|coating/i, "ceramic"],
  [/tint|film/i, "tint"],
  [/detail|polish|correction|interior/i, "detail"],
  [/commercial|office|storefront|home|residential|building|window film/i, "commercial"],
];

export function tagFromCaption(caption: string): GalleryTag | null {
  for (const [re, tag] of CAPTION_TAGS) if (re.test(caption)) return tag;
  return null;
}

export function curatedFor(url: string): Curated | undefined {
  return curatedPhotos.find((c) => url.includes(c.match));
}
