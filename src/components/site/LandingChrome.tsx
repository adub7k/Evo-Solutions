import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, X } from "lucide-react";

import { site } from "@/config/site";
import { trackPhoneClick, trackQuoteClick } from "@/lib/analytics";
import type { ChannelPhone } from "@/lib/channel";
import { useScrolledPast } from "@/lib/useScrolledPast";

/**
 * The chrome every paid landing page shares: a header that is only a logo and
 * a phone number, the mobile action bar, and the Meta offer bar. Pages own
 * their copy and sections; this file owns the two pieces that must behave
 * identically on /tint and /ppf so a fix on one can't be forgotten on the other.
 */

/* ================================================================ header == */

/**
 * A logo and a phone number. No navigation menu — the phone number is the one
 * competing call to action, and it earns its place: on paid mobile traffic a
 * call is worth more than a form fill. The logo itself is the single way off
 * the page (owner's request 2026-09-16): it goes home, where the full site is.
 */
export function LandingHeader({ phone }: { phone: ChannelPhone }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          aria-label={`${site.business.name} — home`}
          className="tap-target gap-2.5 rounded-md"
        >
          <img
            src="/img/evo-solutions-mark-512.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-display text-base font-bold tracking-tight">
            {site.business.name}
          </span>
        </Link>
        {/* The number itself, at every width. Search visitors comparing three
            shops call the one whose number they can see — "Call" hides the
            fact that satisfies them fastest. */}
        <a
          href={phone.href}
          onClick={() => trackPhoneClick("landing-header")}
          className="tap-target gap-2 whitespace-nowrap font-display text-sm font-semibold text-accent sm:text-base"
        >
          <Phone className="h-4 w-4" />
          {phone.display}
        </a>
      </div>
    </header>
  );
}

/* ============================================================= offer bar == */

/**
 * The Meta offer bar. Confirms the offer the ad promised — nothing more — and
 * dismisses for the pageview. Existing tokens only: accent-soft wash on the
 * page background, standard borders.
 */
export function OfferBar({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  return (
    <div className="border-b border-border bg-accent-soft">
      <div className="container-x flex items-center justify-between gap-3 py-2.5">
        <p className="text-sm">
          <span className="font-semibold text-accent">Meta offer:</span> {text}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss offer"
          className="tap-target shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================ sticky bar == */

/**
 * The phone-only action bar. It stays hidden until the hero's own buttons are
 * behind the visitor, and hides again whenever either form is on screen —
 * pointing at something someone is already looking at just costs them a tap
 * target at the bottom of the page.
 */
export function StickyBar({
  phone,
  cta,
  service,
  formIds = ["quote", "quote-close"],
}: {
  phone: ChannelPhone;
  /** Button label — must match the page's primary CTA word for word. */
  cta: string;
  /** Analytics service label, e.g. "Window tint" / "PPF". */
  service: string;
  formIds?: string[];
}) {
  const { past, sentinel } = useScrolledPast("70vh");
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = formIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setFormInView(seen.size > 0);
      },
      { threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // formIds is a stable literal per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = past && !formInView;
  const target = `#${formIds[formIds.length - 1]}`;

  return (
    <>
      {sentinel}
      <div
        aria-hidden={!shown}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-out lg:hidden ${
          shown ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex gap-2 px-4 py-2.5">
          <a
            href={phone.href}
            onClick={() => trackPhoneClick("landing-sticky")}
            tabIndex={shown ? undefined : -1}
            className="btn btn-ghost flex-1"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a
            href={target}
            onClick={() => trackQuoteClick("landing-sticky", service)}
            tabIndex={shown ? undefined : -1}
            className="btn btn-primary flex-[1.4]"
          >
            {cta}
          </a>
        </div>
      </div>
    </>
  );
}
