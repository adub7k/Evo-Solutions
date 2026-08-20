import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { trackPhoneClick, trackQuoteClick } from "@/lib/analytics";

export function FinalCTA({
  heading = "Ready to protect or transform your vehicle?",
  body = "Tell us what you drive and what's bothering you. You'll get a straight recommendation and a flat price — no pressure, no upsell to film you don't need.",
  location = "final-cta",
  service,
}: {
  heading?: string;
  body?: string;
  location?: string;
  service?: string;
}) {
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="container-x section-y">
        <div className="mx-auto max-w-2xl text-center">
          <h2>{heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">
            {body}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/quote"
              onClick={() => trackQuoteClick(location, service)}
              className="btn btn-primary btn-lg"
            >
              Get My Free Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={site.business.phoneHref}
              onClick={() => trackPhoneClick(location)}
              className="btn btn-ghost btn-lg"
            >
              <Phone className="h-4 w-4" />
              {site.business.phone}
            </a>
          </div>

          <p className="mt-7 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            {site.business.address}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Mon–Sat, 10:00 AM – 6:00 PM</p>
        </div>
      </div>
    </section>
  );
}
