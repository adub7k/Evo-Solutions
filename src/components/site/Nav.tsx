import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { trackPhoneClick, trackQuoteClick } from "@/lib/analytics";

const LOGO_MARK = "/img/evo-solutions-logo-256.png";

const serviceLinks = services.map((s) => ({ href: `/${s.slug}`, label: s.navLabel }));
const primaryLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes whichever layer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setServicesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Small close delay so the pointer can cross the gap into the dropdown.
  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
          scrolled || open
            ? "border-border bg-background/95 shadow-[0_1px_0_0_rgba(255,255,255,0.03)] backdrop-blur-sm"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="container-x">
          <div
            className={`flex items-center justify-between gap-4 transition-[height] duration-300 ease-out ${
              scrolled ? "h-[3.75rem]" : "h-[4.5rem]"
            }`}
          >
            <Link
              to="/"
              className="flex items-center gap-2.5 min-w-0"
              aria-label={`${site.business.name} — home`}
            >
              {/*
              Deliberately the bundled mark, not the ShopFlow upload. Angelo's
              logo there is a JPEG of the badge on a solid black card with no
              alpha, so it renders as a black box against the dark page. This
              is the same artwork with the card keyed out. Blend modes can't
              fix it here — the fixed header is its own stacking context, so
              the image has no page backdrop to blend against.
              To change it: replace /public/img/evo-solutions-logo-*.png.
            */}
              <img
                src={LOGO_MARK}
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain"
              />
              <span className="font-display text-[1.0625rem] sm:text-lg font-bold tracking-[-0.02em] uppercase leading-none">
                Evo Solutions
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
              <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
                <button
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setServicesOpen((v) => !v)}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                >
                  Services
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`absolute left-0 top-full pt-2 transition-[opacity,transform] duration-200 ease-out ${
                    servicesOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-1 opacity-0"
                  }`}
                >
                  {
                    <div className="panel w-64 p-1.5 shadow-[var(--shadow-lift)]">
                      {serviceLinks.map((l) => (
                        <Link
                          key={l.href}
                          to={l.href}
                          onClick={() => setServicesOpen(false)}
                          className="block rounded-md px-3 py-2.5 text-sm text-foreground/85 hover:bg-surface-2 hover:text-foreground transition-colors"
                        >
                          {l.label}
                        </Link>
                      ))}
                      <div className="my-1.5 h-px bg-border" />
                      <Link
                        to="/tint-laws-new-mexico"
                        onClick={() => setServicesOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm text-accent transition-colors hover:bg-surface-2"
                      >
                        New Mexico tint laws →
                      </Link>
                    </div>
                  }
                </div>
              </div>

              {primaryLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="nav-link rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{
                    className: "nav-link is-active rounded-md px-3 py-2 text-sm text-foreground",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <a
                href={site.business.phoneHref}
                onClick={() => trackPhoneClick("nav")}
                className="hidden xl:flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                {site.business.phone}
              </a>
              <Link
                to="/quote"
                onClick={() => trackQuoteClick("nav")}
                className="btn btn-primary text-sm"
              >
                Get My Free Quote
              </Link>
            </div>

            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden grid h-11 w-11 -mr-2 place-items-center rounded-md text-foreground"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/*
        Rendered OUTSIDE <header> on purpose. The header uses backdrop-blur
        when scrolled or open, and backdrop-filter makes an element the
        containing block for any position:fixed descendant — which pinned this
        sheet to the 4.5rem header box and collapsed it to nothing.

        Always mounted so closing animates too; conditionally rendering it made
        the sheet vanish instantly on close, which read as a flash. Hidden from
        assistive tech and out of the tab order while shut.
      */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-x-0 bottom-0 z-50 overflow-y-auto overscroll-contain border-t border-border bg-background transition-[opacity,transform] duration-250 ease-out lg:hidden ${
          scrolled ? "top-[3.75rem]" : "top-[4.5rem]"
        } ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
      >
        <nav className="container-x flex flex-col py-5" aria-label="Mobile">
          <button
            onClick={() => setMobileServices((v) => !v)}
            className="flex items-center justify-between py-3.5 text-left font-display text-lg font-semibold"
            aria-expanded={mobileServices}
            aria-controls="mobile-services"
          >
            Services
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                mobileServices ? "rotate-180" : ""
              }`}
            />
          </button>
          {/* 0fr -> 1fr animates height without measuring anything in JS. */}
          <div
            id="mobile-services"
            className={`grid transition-[grid-template-rows] duration-250 ease-out ${
              mobileServices ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="mb-2 ml-1 flex flex-col border-l border-border pl-4">
                {serviceLinks.map((l) => (
                  <Link
                    key={l.href}
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className="py-3 text-[0.9375rem] text-muted-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/tint-laws-new-mexico"
                  onClick={() => setOpen(false)}
                  className="py-3 text-[0.9375rem] text-accent"
                >
                  New Mexico tint laws
                </Link>
              </div>
            </div>
          </div>

          {primaryLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="border-t border-border py-3.5 font-display text-lg font-semibold"
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/quote"
            onClick={() => {
              trackQuoteClick("mobile-menu");
              setOpen(false);
            }}
            className="btn btn-primary btn-lg mt-6"
          >
            Get My Free Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={site.business.phoneHref}
            onClick={() => trackPhoneClick("mobile-menu")}
            className="btn btn-ghost mt-3"
          >
            <Phone className="h-4 w-4" />
            {site.business.phone}
          </a>
          <p className="mt-6 pb-8 text-sm text-muted-foreground">
            {site.business.address}
            <br />
            Mon–Sat 10:00 AM – 6:00 PM
          </p>
        </nav>
      </div>
    </>
  );
}
