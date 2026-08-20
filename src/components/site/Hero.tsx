import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { site } from "@/config/site";
import { images } from "@/config/images";
import { useWideSiteImage } from "@/lib/shopGallery";
import { trackQuoteClick } from "@/lib/analytics";

/**
 * Homepage hero.
 *
 * The image is a real customer car in Evo's own bay, bundled locally and
 * rendered server-side so it's the LCP element rather than something that
 * appears after a client fetch. If Angelo sets a hero in ShopFlow it takes
 * over once the API responds.
 */
export function Hero() {
  const heroSrc = useWideSiteImage("hero", images.hero.webp);
  const isBundled = heroSrc === images.hero.webp;

  return (
    <section className="relative isolate flex min-h-[38rem] items-end overflow-hidden pt-[4.5rem] lg:min-h-[86vh]">
      <div className="absolute inset-0 -z-10">
        {/*
          LCP element. The bundled photo ships as AVIF with a WebP fallback and
          a responsive srcset; an owner upload from ShopFlow is a single JPEG,
          so it renders plainly rather than inheriting the wrong descriptors.
          Explicit width/height reserve the box either way.
        */}
        {isBundled ? (
          <picture>
            <source type="image/avif" srcSet={images.hero.avifSrcSet} sizes={images.hero.sizes} />
            <source type="image/webp" srcSet={images.hero.webpSrcSet} sizes={images.hero.sizes} />
            <img
              src={heroSrc}
              alt={images.hero.alt}
              width={images.hero.width}
              height={images.hero.height}
              fetchPriority="high"
              decoding="sync"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        ) : (
          <img
            src={heroSrc}
            alt={images.hero.alt}
            width={images.hero.width}
            height={images.hero.height}
            fetchPriority="high"
            decoding="sync"
            className="h-full w-full object-cover object-center"
          />
        )}
        {/* Two scrims: vertical for the copy block, horizontal so the left
            edge stays dark enough for text on wide screens. */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/35 to-transparent" />
        {/* Protects nav contrast regardless of how light the photo's sky is. */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/80 to-transparent" />
      </div>

      <div className="container-x relative w-full pb-14 pt-24 sm:pb-20 lg:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow hero-step-1">Albuquerque, New Mexico</p>

          <h1 className="hero-step-1 mt-4">
            Window tint and paint protection,
            <span className="text-accent"> done properly.</span>
          </h1>

          <p className="hero-step-2 mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            An Albuquerque shop doing tint, paint protection film, ceramic coating and detailing —
            on daily drivers, and on the cars people don't hand over lightly.
          </p>

          <p className="hero-step-2 mt-5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground/85">
            Window Tint <span className="text-faint-foreground">·</span> Ceramic Coating{" "}
            <span className="text-faint-foreground">·</span> PPF{" "}
            <span className="text-faint-foreground">·</span> Detailing
          </p>

          <div className="hero-step-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/quote"
              onClick={() => trackQuoteClick("hero")}
              className="btn btn-primary btn-lg"
            >
              Get My Free Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/gallery" className="btn btn-ghost btn-lg">
              View Our Work
            </Link>
          </div>

          <div className="hero-step-4 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="flex" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </span>
              <span className="text-foreground">{site.reviews.rating.toFixed(1)}</span>
              on Google ({site.reviews.count} reviews)
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>Locally owned on Vista Alameda</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>Walk-ins welcome</span>
          </div>
        </div>
      </div>
    </section>
  );
}
