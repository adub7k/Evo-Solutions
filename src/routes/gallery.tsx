import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/config/site";
import { fetchShopGallery, type ShopPhoto } from "@/lib/shopGallery";

const TITLE = "Work Gallery — Tint, PPF & Detailing in Albuquerque | Evo Solutions";
const DESC =
  "Recent window tint, paint protection film, ceramic coating, and detailing work from our Albuquerque shop.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "https://www.evosolution.org/gallery" }],
  }),
  component: RouteComponent,
});

// Config placeholders keep the page presentable until Angelo uploads real
// work in ShopFlow → Settings → Work Gallery; live photos replace them.
const fallback: ShopPhoto[] = site.gallery.map((g, i) => ({
  id: `stock-${i}`,
  url: g.src,
  caption: g.caption,
}));

function RouteComponent() {
  const [photos, setPhotos] = useState<ShopPhoto[]>(fallback);
  const [live, setLive] = useState(false);
  const [active, setActive] = useState<ShopPhoto | null>(null);

  useEffect(() => {
    fetchShopGallery().then((shop) => {
      if (shop && shop.length >= 1) {
        setPhotos(shop);
        setLive(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <SiteLayout>
      <section className="pt-32 pb-10 sm:pt-40">
        <div className="container-x max-w-3xl">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Recent Work</div>
          <h1 className="mt-4 text-4xl sm:text-6xl text-balance leading-[1.05]">
            Straight off the shop floor.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
            {live
              ? "Every photo below is our own work, uploaded straight from the shop."
              : "A sample of the kind of work we do — fresh photos from the shop are added regularly."}
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {photos.map((g, i) => (
              <Reveal key={g.id} delay={(i % 6) * 40} className="group relative overflow-hidden rounded-2xl hairline">
                <button
                  onClick={() => setActive(g)}
                  className="block w-full text-left"
                  aria-label={`View ${g.caption || "photo"}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={g.url}
                      alt={g.caption || "Detail work"}
                      loading={i < 6 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  {g.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-4 pb-3 pt-10">
                      <div className="text-sm font-medium">{g.caption}</div>
                    </div>
                  )}
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {site.videos.length > 0 && (
        <section className="pb-20">
          <div className="container-x">
            <Reveal className="max-w-2xl mb-10">
              <div className="text-xs uppercase tracking-[0.24em] text-accent">Watch</div>
              <h2 className="mt-4 text-3xl sm:text-4xl">The process, on video.</h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {site.videos.map((v) => (
                <Reveal key={v.youtubeId} className="overflow-hidden rounded-2xl hairline">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                      title={v.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                  <div className="px-4 py-3 text-sm text-muted-foreground">{v.title}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-24">
        <div className="container-x">
          <Reveal className="rounded-3xl hairline bg-card p-8 sm:p-12 text-center shadow-elevated">
            <h2 className="text-3xl sm:text-4xl">Want yours in this gallery?</h2>
            <a
              href="/#quote"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110 transition-all"
            >
              Get a Free Quote
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {active && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-background/98 p-4 sm:p-8 animate-fade-in"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-6 right-6 grid h-11 w-11 place-items-center rounded-full glass hover:bg-surface-elevated"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={active.url} alt={active.caption || "Detail work"} className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </SiteLayout>
  );
}
