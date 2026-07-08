import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";
import { X } from "lucide-react";

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);

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
        <Reveal className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Recent Work</div>
          <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
            A gallery of vehicles that leave looking better than they came in.
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {site.gallery.map((g, i) => (
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
                aria-label={`View ${g.caption}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
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

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={site.gallery[active].caption}
          className="fixed inset-0 z-[100] grid place-items-center bg-background/95 p-4 sm:p-8 animate-fade-in backdrop-blur-md"
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
            src={site.gallery[active].src}
            alt={site.gallery[active].alt}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
