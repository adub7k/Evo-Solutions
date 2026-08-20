import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, Navigation, ArrowRight } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section, SectionHead } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { services } from "@/content/services";
import { seo, breadcrumbLd } from "@/lib/seo";
import { trackContactClick, trackPhoneClick, trackQuoteClick } from "@/lib/analytics";

const PATH = "/contact";
const TITLE = "Contact Evo Solutions — Albuquerque, NM | Hours & Directions";
const DESC =
  "Call, email or visit Evo Solutions at 3500 Vista Alameda NE Suite A, Albuquerque NM 87113. Open Monday to Saturday, 10:00 AM – 6:00 PM. Walk-ins welcome.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Contact", path: PATH },
];

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  site.business.mapsQuery,
)}&output=embed`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  site.business.mapsQuery,
)}`;

export const Route = createFileRoute("/contact")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESC, path: PATH });
    return {
      ...meta,
      scripts: [{ type: "application/ld+json", children: breadcrumbLd(CRUMBS) }],
    };
  },
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x pb-12 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div className="animate-rise">
              <p className="eyebrow">Contact</p>
              <h1 className="mt-4">Come by, or give us a call.</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We're on Vista Alameda in northeast Albuquerque. Walk-ins are welcome Monday to
                Saturday — though for anything bigger than a wash, calling ahead means we can set
                the time aside.
              </p>

              <dl className="mt-9 space-y-6">
                <div className="flex gap-4">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd>
                      <a
                        href={site.business.phoneHref}
                        onClick={() => trackPhoneClick("contact-page")}
                        className="tap-target font-display text-2xl font-bold text-accent"
                      >
                        {site.business.phone}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <div className="min-w-0">
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd>
                      <a
                        href={site.business.emailHref}
                        onClick={() => trackContactClick("email")}
                        className="tap-target break-all text-lg transition-colors hover:text-accent"
                      >
                        {site.business.email}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Shop</dt>
                    <dd className="text-lg not-italic">
                      {site.business.addressParts.street}
                      <br />
                      {site.business.addressParts.city}, {site.business.addressParts.state}{" "}
                      {site.business.addressParts.zip}
                    </dd>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackContactClick("directions")}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent underline underline-offset-4"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get directions
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Hours</dt>
                    <dd className="text-lg">
                      {site.business.hours.map((h) => (
                        <span key={h.day} className="block">
                          <span className={h.open ? "" : "text-muted-foreground"}>
                            {h.day}: {h.value}
                          </span>
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-9 rounded-lg border border-border bg-surface/50 p-6">
                <p className="font-display font-semibold">Want a price before you come in?</p>
                <p className="mt-2 text-muted-foreground">
                  The quote form takes about a minute and gets you a flat number rather than a
                  range.
                </p>
                <Link
                  to="/quote"
                  onClick={() => trackQuoteClick("contact-page")}
                  className="btn btn-primary mt-5"
                >
                  Get My Free Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <Reveal delay={60}>
              <div className="overflow-hidden rounded-lg border border-border">
                <iframe
                  title={`Map showing ${site.business.name} in Albuquerque`}
                  src={mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[26rem] w-full border-0 lg:h-[34rem]"
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Northeast Albuquerque, off Alameda. Parking on site.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <Section tone="raised" tight>
        <div className="container-x">
          <SectionHead eyebrow="Service area" title="Where we work." body={site.serviceArea.note} />
          <p className="mt-6 text-muted-foreground">
            <span className="text-foreground">Vehicles:</span> at the Albuquerque shop.{" "}
            <span className="text-foreground">Commercial and home glass:</span>{" "}
            {site.serviceArea.primary}, {site.serviceArea.nearby.join(", ")}.
          </p>

          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} className="border-b border-border">
                <Link to={s.route} className="group flex items-center justify-between gap-4 py-4">
                  <span className="font-display font-semibold">{s.serviceName}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </SiteLayout>
  );
}
