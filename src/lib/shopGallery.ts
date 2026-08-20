/**
 * Live content from ShopFlow.
 *
 * Angelo manages the shop's photos, team and gallery in ShopFlow → Settings;
 * they appear here without a deploy. Everything is fetched from one /info
 * response, shared across the page.
 *
 * FALLBACKS ARE HIS PHOTOS, NOT STOCK. The images under /img are optimized
 * copies of the shop's own work, bundled so the hero renders instantly and the
 * site still looks like Evo Solutions if the API is unreachable. There is no
 * stock photography anywhere in this project and none should be added.
 */

import { useEffect, useState } from "react";
import { publicApi, shopflow } from "@/config/shopflow";
import { curatedFor, tagFromCaption } from "@/content/gallery";
import type { GalleryTag } from "@/content/services";

export type ShopPhoto = {
  id: string;
  url: string;
  caption: string;
  alt: string;
  tag: GalleryTag | null;
  /** Render inside a 3/4 frame to trim baked-in letterbox bars. */
  letterboxed: boolean;
  /** Intrinsic size, when known, so the grid can reserve the box up front. */
  w?: number;
  h?: number;
};
export type TeamMember = { id: string; name: string; title: string; bio: string; photo: string };

/** Uploads are served as /uploads/:shopId/:file from the platform host. */
const resolveUrl = (u: string) => (u.startsWith("http") ? u : shopflow.apiBase + u);

let infoPromise: Promise<Record<string, unknown> | null> | null = null;

function getInfo(): Promise<Record<string, unknown> | null> {
  if (!infoPromise) {
    infoPromise = fetch(publicApi("/info"))
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .catch(() => null); // callers keep their fallback
  }
  return infoPromise;
}

/* ------------------------------------------------------------- gallery -- */

export async function fetchShopGallery(): Promise<ShopPhoto[]> {
  const info = await getInfo();
  if (!info) return [];
  const items = Array.isArray(info.gallery) ? info.gallery : [];
  return items
    .filter((g: { url?: string }) => typeof g?.url === "string" && g.url)
    .map((g: { id?: string; url: string; caption?: string }) => {
      const url = resolveUrl(g.url);
      const ownerCaption = String(g.caption ?? "").trim();
      const curated = curatedFor(g.url);
      // Owner's own caption always wins — it's how Angelo corrects our read.
      const caption = ownerCaption || curated?.caption || "";
      const tag = ownerCaption ? tagFromCaption(ownerCaption) : (curated?.tag ?? null);
      return {
        id: String(g.id ?? g.url),
        url,
        caption,
        alt: curated?.alt || caption || "Work completed at Evo Solutions in Albuquerque",
        tag,
        letterboxed: curated?.letterboxed ?? false,
        w: curated?.w,
        h: curated?.h,
      };
    });
}

export function useShopGallery(): { photos: ShopPhoto[]; loading: boolean } {
  const [photos, setPhotos] = useState<ShopPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetchShopGallery().then((p) => {
      if (!alive) return;
      setPhotos(p);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { photos, loading };
}

/* -------------------------------------------------------- site images -- */

export async function fetchSiteImages(): Promise<Record<string, string>> {
  const info = await getInfo();
  const raw =
    info && typeof info.siteImages === "object" && info.siteImages
      ? (info.siteImages as Record<string, unknown>)
      : {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && v) out[k] = resolveUrl(v);
  }
  return out;
}

/**
 * An owner-overridable image slot.
 *
 * `fallback` is a bundled real photo, so the element paints on first render
 * with correct dimensions (no layout shift, good LCP) and only swaps if
 * Angelo has set that slot in ShopFlow.
 */
export function useSiteImage(slot: string, fallback: string): string {
  const [src, setSrc] = useState(fallback);
  useEffect(() => {
    let alive = true;
    fetchSiteImages().then((imgs) => {
      if (alive && imgs[slot]) setSrc(imgs[slot]);
    });
    return () => {
      alive = false;
    };
  }, [slot]);
  return src;
}

/**
 * Like `useSiteImage`, but only accepts the owner's upload when it is wide
 * enough for the slot.
 *
 * The homepage hero is a full-bleed band. A square or portrait upload — a
 * phone shot, or a square social post — gets centre-cropped into it and loses
 * its subject, and a photo with a light sky at the top washes out the nav.
 * Rather than render that, we keep the bundled landscape photo until a
 * suitably wide one is uploaded. See VERIFY.md.
 */
export function useWideSiteImage(slot: string, fallback: string, minRatio = 1.4): string {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    let alive = true;
    let idle: number | undefined;

    fetchSiteImages().then((imgs) => {
      const candidate = imgs[slot];
      if (!alive || !candidate) return;

      // Deciding whether the upload is wide enough means loading it, and if it
      // gets rejected that download is pure waste. So it happens at idle, at
      // low priority, AFTER the bundled hero has already painted — it must
      // never compete with the LCP image for bandwidth.
      const probe = () => {
        if (!alive) return;
        const img = new Image();
        img.decoding = "async";
        // Not in every browser's typings yet, but honoured where supported.
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
        img.onload = () => {
          if (!alive) return;
          if (img.naturalWidth / img.naturalHeight >= minRatio) setSrc(candidate);
        };
        img.src = candidate;
      };

      const ric = (
        window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number }
      ).requestIdleCallback;
      idle = ric ? ric(probe, { timeout: 3000 }) : window.setTimeout(probe, 1200);
    });

    return () => {
      alive = false;
      if (idle !== undefined) window.clearTimeout(idle);
    };
  }, [slot, fallback, minRatio]);

  return src;
}

/* ---------------------------------------------------------------- team -- */

export async function fetchSiteTeam(): Promise<TeamMember[]> {
  const info = await getInfo();
  const raw = info && Array.isArray(info.siteTeam) ? info.siteTeam : [];
  return raw
    .filter((m: { name?: string }) => m && typeof m.name === "string" && m.name.trim())
    .map((m: { id?: string; name: string; title?: string; bio?: string; photo?: string }) => ({
      id: String(m.id ?? m.name),
      name: String(m.name),
      title: String(m.title ?? ""),
      bio: String(m.bio ?? ""),
      photo: m.photo ? resolveUrl(String(m.photo)) : "",
    }));
}

export function useSiteTeam(): TeamMember[] {
  const [team, setTeam] = useState<TeamMember[]>([]);
  useEffect(() => {
    let alive = true;
    fetchSiteTeam().then((t) => alive && setTeam(t));
    return () => {
      alive = false;
    };
  }, []);
  return team;
}
