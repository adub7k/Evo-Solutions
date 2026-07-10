import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { Menu, X, Phone, ChevronDown } from "lucide-react";

// Real pages lead the nav so the site navigates like the multi-page site it
// is; a couple of home-page sections stay as hash links.
const serviceLinks = services.map((s) => ({ href: `/${s.slug}`, label: s.serviceName }));
const primaryLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/#reviews", label: "Reviews" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [servicesOpen, setServicesOpen] = useState(false); // desktop dropdown
  const [mobileServices, setMobileServices] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container-x">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-colors duration-300 ${
            scrolled ? "glass shadow-elevated" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg ember-gradient">
              <span className="font-display text-lg text-primary-foreground">
                {site.business.name.charAt(0)}
              </span>
            </div>
            <span className="font-display text-xl sm:text-2xl truncate">{site.business.name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setServicesOpen((v) => !v)}
                aria-expanded={servicesOpen}
              >
                Services
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              {servicesOpen && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                  <div className="w-56 rounded-2xl glass shadow-elevated p-2">
                    {serviceLinks.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        className="block rounded-xl px-4 py-2.5 text-sm text-foreground/85 hover:bg-surface-elevated hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </a>
                    ))}
                    <a
                      href="/tint-laws-new-mexico"
                      className="block rounded-xl px-4 py-2.5 text-sm text-accent hover:bg-surface-elevated transition-colors"
                    >
                      NM Tint Law Guide
                    </a>
                  </div>
                </div>
              )}
            </div>

            {primaryLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href={site.business.phoneHref}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {site.business.phone}
            </a>
            <a
              href="/#quote"
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:brightness-110 transition-all shadow-glow"
            >
              Get Free Quote
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid place-items-center h-10 w-10 rounded-lg hairline"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden mt-2 glass rounded-2xl p-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {/* Services accordion */}
              <button
                onClick={() => setMobileServices((v) => !v)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
                aria-expanded={mobileServices}
              >
                Services
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileServices ? "rotate-180" : ""}`} />
              </button>
              {mobileServices && (
                <div className="ml-3 flex flex-col border-l border-border/60 pl-3">
                  {serviceLinks.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm text-foreground/85 hover:bg-surface-elevated transition-colors"
                    >
                      {l.label}
                    </a>
                  ))}
                  <a
                    href="/tint-laws-new-mexico"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm text-accent hover:bg-surface-elevated transition-colors"
                  >
                    NM Tint Law Guide
                  </a>
                </div>
              )}

              {primaryLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={site.business.phoneHref}
                className="px-3 py-3 rounded-lg text-muted-foreground hover:bg-surface-elevated flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {site.business.phone}
              </a>
              <a
                href="/#quote"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
              >
                Get Free Quote
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
