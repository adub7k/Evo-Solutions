import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/config/site";
import { images, bundledFor, type ServiceImageSlot } from "@/config/images";
import { useSiteImage } from "@/lib/shopGallery";
import { trackPhoneClick, trackQuoteClick } from "@/lib/analytics";
import { Breadcrumbs } from "./Breadcrumbs";
import { Photo } from "./Photo";
import { TrustLine } from "./TrustBar";

/**
 * Service-page hero. Split layout rather than the homepage's full-bleed one,
 * so the H1 and the CTA are both above the fold on a phone — this is where
 * paid traffic lands and the first screen has to do the whole job.
 */
export function ServiceHero({
  eyebrow,
  headline,
  sub,
  slot,
  serviceName,
  breadcrumbs,
}: {
  eyebrow: string;
  headline: string;
  sub: string;
  slot: ServiceImageSlot;
  serviceName: string;
  breadcrumbs: { name: string; path: string }[];
}) {
  const fallback = images.service[slot];
  const src = useSiteImage(slot, fallback.webp);
  const bundled = bundledFor(slot, src);

  return (
    <section className="relative overflow-hidden pt-[4.5rem]">
      <div className="container-x pb-12 pt-8 sm:pb-16 sm:pt-12">
        <Breadcrumbs trail={breadcrumbs} />

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="animate-rise">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4">{headline}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{sub}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/quote"
                onClick={() => trackQuoteClick("service-hero", serviceName)}
                className="btn btn-primary btn-lg"
              >
                Get My Free Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={site.business.phoneHref}
                onClick={() => trackPhoneClick("service-hero")}
                className="btn btn-ghost btn-lg"
              >
                <Phone className="h-4 w-4" />
                {site.business.phone}
              </a>
            </div>

            <TrustLine className="mt-7" />
          </div>

          <Photo src={src} alt={fallback.alt} ratio="4/3" priority className="lg:aspect-[5/4]" />
        </div>
      </div>
    </section>
  );
}
