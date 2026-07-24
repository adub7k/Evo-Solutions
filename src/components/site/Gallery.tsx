import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";
import { X, ArrowRight } from "lucide-react";
import { fetchShopGallery } from "@/lib/shopGallery";

type Item = { src: string; alt: string; caption: string };

// Stock placeholders until the shop's own uploads (ShopFlow → Settings →
// Work Gallery) come back from the API — then real work replaces them.
const fallback: Item[] = site.gallery;

export function Gallery() {
  const [items, setItems] = useState<Item[]>(fallback);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    fetchShopGallery().then((shop) => {
      if (shop && shop.length >= 1) {
        setItems(
          shop.slice(0, 6).map((p) => ({ src: p.url, alt: p.caption || "Our work", caption: p.caption }))
        );
      }
    });
  }, []);

  // Close the lightbox with Escape and keep the page from scrolling under it.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <section id="gallery" className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Recent Work</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              A gallery of vehicles that leave looking better than they came in.
            </h2>
          </div>
          <Link to="/gallery" className="inline-flex shrink-0 items-center gap-2 text-sm text-accent hover:underline">
            View full gallery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {items.map((g, i) => (
            <Reveal
              key={g.src}
              delay={i * 60}
              className={`group relative overflow-hidden rounded-2xl hairline cursor-pointer ${
                i === 0 || i === 4 ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <button
                onClick={() => setActive(i)}
                className="block w-full h-full text-left"
                aria-label={`View ${g.caption || "photo"}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-90" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-accent">Featured</div>
                  <div className="mt-1 text-sm sm:text-base font-medium text-foreground">
                    {g.caption}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active !== null && items[active] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={items[active].caption || "Photo"}
          className="fixed inset-0 z-[100] grid place-items-center bg-background/98 p-4 sm:p-8 animate-fade-in"
          onClick={() => setActive(null)}
        >
          <button
            autoFocus
            onClick={() => setActive(null)}
            className="absolute top-6 right-6 grid h-11 w-11 place-items-center rounded-full glass hover:bg-surface-elevated"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={items[active].src}
            alt={items[active].alt}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
