import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services, type ServiceRoute } from "@/content/services";
import { images, bundledFor, type ServiceImageSlot } from "@/config/images";
import { useSiteImage } from "@/lib/shopGallery";
import { usePricing, startingAt } from "@/lib/pricing";
import { StartingAt } from "./PricingTable";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

/**
 * The four vehicle services get equal weight; commercial sits below as a
 * wide band so it can't dilute the automotive positioning of the page.
 */
export function ServiceGrid() {
  const auto = services.filter((s) => s.variant !== "commercial");
  const commercial = services.find((s) => s.variant === "commercial");
  const pricing = usePricing();

  return (
    <>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {auto.map((s, i) => (
          <Reveal key={s.slug} delay={i * 60}>
            <ServiceCard
              route={s.route}
              slot={s.imageSlot as ServiceImageSlot}
              name={s.serviceName}
              blurb={s.cardBlurb}
              benefits={s.cardBenefits}
              from={s.quoteOnly ? null : startingAt(pricing, s.slug)}
            />
          </Reveal>
        ))}
      </div>

      {commercial && (
        <Reveal className="mt-6">
          <Link
            to={commercial.route}
            className="group grid items-stretch gap-0 overflow-hidden rounded-lg border border-border bg-surface/50 transition-colors hover:border-line-strong sm:grid-cols-[1fr_1.4fr]"
          >
            <CommercialImage />
            <div className="p-6 sm:p-8">
              <p className="eyebrow">Not just cars</p>
              <h3 className="mt-2.5 font-display text-2xl">{commercial.serviceName}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{commercial.cardBlurb}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                {commercial.cardBenefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Offices, storefronts & homes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </Reveal>
      )}
    </>
  );
}

function CommercialImage() {
  const src = useSiteImage("service_commercial", images.service.service_commercial.webp);
  const bundled = bundledFor("service_commercial", src);
  return (
    <Photo
      src={src}
      avif={bundled?.avif}
      alt={images.service.service_commercial.alt}
      ratio="4/3"
      className="h-full rounded-none sm:aspect-auto"
      imgClassName="object-center"
    />
  );
}

function ServiceCard({
  route,
  slot,
  name,
  blurb,
  benefits,
  from,
}: {
  route: ServiceRoute;
  slot: ServiceImageSlot;
  name: string;
  blurb: string;
  benefits: string[];
  from: number | null;
}) {
  const fallback = images.service[slot];
  const src = useSiteImage(slot, fallback.webp);
  const bundled = bundledFor(slot, src);

  return (
    <Link
      to={route}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface/50 transition-colors hover:border-line-strong"
    >
      <Photo
        src={src}
        avif={bundled?.avif}
        alt={fallback.alt}
        ratio="16/10"
        className="rounded-none"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl">{name}</h3>
          <StartingAt amount={from} />
        </div>
        <p className="mt-2.5 leading-relaxed text-muted-foreground">{blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {benefits.map((b) => (
            <li key={b} className="before:mr-2 before:text-accent before:content-['—']">
              {b}
            </li>
          ))}
        </ul>
        <span className="mt-5 inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-accent">
          See {name.toLowerCase()}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
