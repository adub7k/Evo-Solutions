// Live content from ShopFlow: photos Angelo manages in ShopFlow → Settings
// appear on the site without a deploy.
//   • Work Gallery (a list)      → the gallery grid + /gallery page
//   • Website Photos (named slots) → the hero background + per-service tiles
import { publicApi, shopflow } from "@/config/shopflow";

export type ShopPhoto = { id: string; url: string; caption: string };

// Uploads are stored as /uploads/:shopId/:file on the platform host — turn a
// relative path into an absolute URL; leave already-absolute URLs untouched.
const resolveUrl = (u: string) => (u.startsWith("http") ? u : shopflow.apiBase + u);

// Both the gallery and the site-image overrides come from the same /info
// response, so fetch it once per page load and share the result.
let infoPromise: Promise<Record<string, unknown> | null> | null = null;
function getInfo(): Promise<Record<string, unknown> | null> {
  if (!infoPromise) {
    infoPromise = fetch(publicApi("/info"))
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .catch(() => null); // callers keep their fallback when this is null
  }
  return infoPromise;
}

export async function fetchShopGallery(): Promise<ShopPhoto[] | null> {
  const info = await getInfo();
  if (!info) return null;
  const items = Array.isArray(info.gallery) ? info.gallery : [];
  return items
    .filter((g: { url?: string }) => typeof g.url === "string" && g.url)
    .map((g: { id?: string; url: string; caption?: string }) => ({
      id: String(g.id ?? g.url),
      url: resolveUrl(g.url),
      caption: String(g.caption ?? ""),
    }));
}

// Owner overrides for the site's fixed stock photos, keyed by slot
// ("hero", "service_tint", "service_ceramic", "service_ppf", "service_detail").
// Returns an empty map when unset or the API is unreachable, so callers always
// fall back to their built-in defaults.
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
