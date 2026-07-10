// Live work gallery from ShopFlow: photos Angelo uploads in
// ShopFlow → Settings → Work Gallery appear on the site without a deploy.
import { publicApi, shopflow } from "@/config/shopflow";

export type ShopPhoto = { id: string; url: string; caption: string };

let cache: ShopPhoto[] | null | undefined; // undefined = not fetched yet

export async function fetchShopGallery(): Promise<ShopPhoto[] | null> {
  if (cache !== undefined) return cache;
  try {
    const res = await fetch(publicApi("/info"));
    if (!res.ok) throw new Error(String(res.status));
    const info = await res.json();
    const items = Array.isArray(info.gallery) ? info.gallery : [];
    cache = items
      .filter((g: { url?: string }) => typeof g.url === "string" && g.url)
      .map((g: { id?: string; url: string; caption?: string }) => ({
        id: String(g.id ?? g.url),
        // Uploads are stored as /uploads/:shopId/:file on the platform host.
        url: g.url.startsWith("http") ? g.url : shopflow.apiBase + g.url,
        caption: String(g.caption ?? ""),
      }));
  } catch {
    cache = null; // callers keep their fallback when this is null
  }
  return cache ?? null;
}
