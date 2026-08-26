/**
 * Bundled imagery — optimized copies of Evo Solutions' own photos.
 *
 * Each is overridden at runtime by the matching ShopFlow "Website Photos" slot,
 * so Angelo stays in control. No stock photography, ever.
 *
 * Two formats are shipped: AVIF (roughly 35% smaller) with WebP as the
 * fallback. Browsers pick via <picture>; anything that understands neither is
 * vanishingly rare and still gets the WebP.
 */

type Sized = {
  avif: string;
  webp: string;
  width: number;
  height: number;
  alt: string;
};

const HERO_W = [800, 1200, 1800] as const;
const heroSet = (ext: "avif" | "webp") =>
  HERO_W.map(
    (w, i) => `/img/evo-solutions-albuquerque-hero-${w}.${ext} ${[800, 1200, 1280][i]}w`,
  ).join(", ");

export const images = {
  hero: {
    avif: "/img/evo-solutions-albuquerque-hero-1800.avif",
    webp: "/img/evo-solutions-albuquerque-hero-1800.webp",
    avifSrcSet: heroSet("avif"),
    webpSrcSet: heroSet("webp"),
    sizes: "100vw",
    width: 1280,
    height: 853,
    alt: "A customer's Porsche 911 Turbo S finished and standing in the Evo Solutions install bay in Albuquerque",
  },
  share: "/img/evo-solutions-share.jpg",
  service: {
    service_tint: {
      avif: "/img/window-tint-albuquerque.avif",
      webp: "/img/window-tint-albuquerque.webp",
      width: 900,
      height: 506,
      alt: "Blue Toyota Camry with freshly installed window tint in the Evo Solutions bay",
    },
    service_ceramic: {
      avif: "/img/ceramic-coating-albuquerque.avif",
      webp: "/img/ceramic-coating-albuquerque.webp",
      width: 900,
      height: 600,
      alt: "Technician finishing a green Audi RS3 after coating work at Evo Solutions",
    },
    service_ppf: {
      avif: "/img/paint-protection-film-albuquerque.avif",
      webp: "/img/paint-protection-film-albuquerque.webp",
      width: 900,
      height: 507,
      alt: "Three Evo Solutions technicians working on the hood of a gold Cadillac CT4-V",
    },
    service_detail: {
      avif: "/img/auto-detailing-albuquerque.avif",
      webp: "/img/auto-detailing-albuquerque.webp",
      width: 900,
      height: 507,
      alt: "Technician working along the front fender of a green Mercedes-AMG GLE 63",
    },
    service_commercial: {
      avif: "/img/commercial-window-tint-albuquerque.avif",
      webp: "/img/commercial-window-tint-albuquerque.webp",
      width: 646,
      height: 862,
      alt: "Filmed glass partition wall inside an Albuquerque restaurant",
    },
  } satisfies Record<string, Sized>,
} as const;

export type ServiceImageSlot = keyof typeof images.service;

/** The bundled default for a slot, or null once an owner upload takes over. */
export function bundledFor(slot: ServiceImageSlot, current: string) {
  const b = images.service[slot];
  return current === b.webp || current === b.avif ? b : null;
}
