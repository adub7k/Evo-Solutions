import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { services } from "@/content/services";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border/60 bg-surface/30 pt-20 pb-10">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 max-w-md">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg ember-gradient">
                <span className="font-display text-lg text-primary-foreground">
                  {site.business.name.charAt(0)}
                </span>
              </div>
              <span className="font-display text-2xl">{site.business.name}</span>
            </div>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              {site.business.tagline}. Premium installations, lifetime warranties, and
              the kind of attention to detail your vehicle deserves.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.business.social.instagram}
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full hairline hover:bg-surface-elevated transition"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={site.business.social.facebook}
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full hairline hover:bg-surface-elevated transition"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={site.business.social.youtube}
                aria-label="YouTube"
                className="grid h-10 w-10 place-items-center rounded-full hairline hover:bg-surface-elevated transition"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Services
            </div>
            <ul className="space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`/${s.slug}`}
                    className="text-foreground/85 hover:text-foreground transition"
                  >
                    {s.serviceName}
                  </a>
                </li>
              ))}
              <li>
                <a href="/tint-laws-new-mexico" className="text-foreground/85 hover:text-foreground transition">
                  NM Tint Laws
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Explore
            </div>
            <ul className="space-y-3 text-sm">
              <li><a href="/gallery" className="text-foreground/85 hover:text-foreground transition">Gallery</a></li>
              <li><a href="/blog" className="text-foreground/85 hover:text-foreground transition">Guides</a></li>
              <li><a href="/about" className="text-foreground/85 hover:text-foreground transition">About</a></li>
              <li><a href="/#quote" className="text-foreground/85 hover:text-foreground transition">Get a Quote</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Contact
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={site.business.phoneHref}
                  className="flex items-start gap-3 text-foreground/85 hover:text-foreground transition"
                >
                  <Phone className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  {site.business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.business.email}`}
                  className="flex items-start gap-3 text-foreground/85 hover:text-foreground transition break-all"
                >
                  <Mail className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  {site.business.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-foreground/85">
                <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                {site.business.address}
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Hours
            </div>
            <ul className="space-y-2.5 text-sm">
              {site.business.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="text-foreground/85">{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {site.business.name}. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
