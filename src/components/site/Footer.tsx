import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { guides } from "@/content/guides";
import { trackContactClick, trackPhoneClick } from "@/lib/analytics";

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  site.business.mapsQuery,
)}`;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="container-x py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* NAP block — this is the one Google reads. Keep it identical to
              the Google Business Profile, character for character. */}
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/img/evo-solutions-logo-256.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="font-display text-lg font-bold uppercase tracking-[-0.02em]">
                Evo Solutions
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Window tint, paint protection film, ceramic coating and detailing in Albuquerque, New
              Mexico. Formerly {site.business.formerName}.
            </p>

            <address className="mt-5 space-y-2.5 text-sm not-italic">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick("directions")}
                className="flex items-start gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {site.business.addressParts.street}
                  <br />
                  {site.business.addressParts.city}, {site.business.addressParts.state}{" "}
                  {site.business.addressParts.zip}
                </span>
              </a>
              <a
                href={site.business.phoneHref}
                onClick={() => trackPhoneClick("footer")}
                className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                {site.business.phone}
              </a>
              <a
                href={site.business.emailHref}
                onClick={() => trackContactClick("email")}
                className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors break-all"
              >
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                {site.business.email}
              </a>
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {site.business.hours.map((h) => (
                    <span key={h.day} className="block">
                      {h.day}: {h.value}
                    </span>
                  ))}
                </span>
              </div>
            </address>
          </div>

          <FooterCol title="Services">
            {services.map((s) => (
              <FooterLink key={s.slug} to={`/${s.slug}`}>
                {s.serviceName}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink to="/gallery">Our Work</FooterLink>
            <FooterLink to="/reviews">Reviews</FooterLink>
            <FooterLink to="/about">About Evo</FooterLink>
            <FooterLink to="/contact">Contact & Directions</FooterLink>
            <FooterLink to="/quote">Get a Quote</FooterLink>
          </FooterCol>

          <FooterCol title="Guides">
            <FooterLink to="/tint-laws-new-mexico">New Mexico Tint Laws</FooterLink>
            {guides.slice(0, 4).map((g) => (
              <FooterLink key={g.slug} to={`/guides/${g.slug}`}>
                {g.navTitle}
              </FooterLink>
            ))}
            <FooterLink to="/guides">All guides</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.business.name}. Albuquerque, New Mexico.
          </p>
          <p>Serving {site.serviceArea.primary} and the surrounding metro.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
