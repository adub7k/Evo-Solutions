import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, Phone, ShieldCheck, Star, X } from "lucide-react";

import { LandingLeadForm } from "@/components/site/LandingLeadForm";
import { Photo } from "@/components/site/Photo";
import { Reveal } from "@/components/site/Reveal";
import { images } from "@/config/images";
import { site } from "@/config/site";
import { reviews } from "@/content/reviews";
import { serviceBySlug } from "@/content/services";
import { trackLandingView, trackPhoneClick, trackQuoteClick } from "@/lib/analytics";
import {
  money,
  startingAt,
  tintTierRange,
  usePricing,
  type Pricing,
  type TintTier,
} from "@/lib/pricing";
import { useShopGallery, useSiteImage } from "@/lib/shopGallery";
import { useScrolledPast } from "@/lib/useScrolledPast";

/**
 * /tint — the paid-social landing page.
 *
 * Not a service page. `window-tint.tsx` is the SEO page: it explains, it links
 * out, it earns rankings. This page has one job, one exit, and one thing to
 * click. Deliberate differences:
 *
 *   • No nav, no footer links, no related services. Every outbound link is a
 *     leak in a page you're paying per click to fill.
 *   • noindex. It duplicates the service page's subject matter and would
 *     otherwise compete with it in search for nothing.
 *   • Numbers up top. Ad traffic arrives cold and mid-scroll; the claim has to
 *     be legible in the first second, not after a paragraph of scene-setting.
 *
 * The performance figures and the warranty come from `site.tintSpecs` — owner-
 * supplied and dated there. This page renders them; it does not invent them,
 * and it still quotes no prices (those live in ShopFlow, per lib/pricing.ts).
 */

const PATH = "/tint";
const TITLE = "Window Tint in Albuquerque | 99% UV Blocked — Evo Solutions";
const DESC =
  "Ceramic and carbon window tint installed in Albuquerque. Blocks 99% of UV, rejects up to 65% of the heat, and carries a lifetime warranty on the film. Get a flat price.";

const TINT = serviceBySlug("window-tint");
const specs = site.tintSpecs;

/* ============================================================== channels == */

type ChannelPhone = { display: string; href: string };

/**
 * Per-channel config — the only knobs this page's ad campaigns should ever
 * need. `?src=google` / `?src=meta` on the ad's final URL picks the row; no
 * parameter (or an unconfigured row) falls back to the shop's real number.
 *
 * Tracking numbers don't exist yet — the Twilio call-tracking build is still
 * pending — so both are null placeholders:
 *   google: {{GOOGLE_TRACKING_NUMBER}}  e.g. { display: "(505) 555-0100", href: "tel:+15055550100" }
 *   meta:   {{META_TRACKING_NUMBER}}
 */
const CHANNEL = {
  phones: {
    default: { display: site.business.phone, href: site.business.phoneHref } as ChannelPhone,
    google: null as ChannelPhone | null,
    meta: null as ChannelPhone | null,
  },
  /**
   * Meta offer bar. The Meta creatives carry the offer, so ?src=meta has to
   * confirm it on landing — and Google traffic, which has no offer context,
   * must never see it. Empty string = the bar never renders. Set it ONLY once
   * Angelo confirms he'll honor the offer (this site publishes no unverified
   * commitments): e.g. "Free windshield strip with any full vehicle tint".
   */
  metaOffer: "", // {{META_OFFER_TEXT}}
};

function useChannel(): { phone: ChannelPhone; offer: string | null } {
  // Read post-mount: query strings don't change the server HTML, and the
  // first client render has to match it.
  const [src, setSrc] = useState<"google" | "meta" | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("src");
    if (p === "google" || p === "meta") setSrc(p);
  }, []);
  return {
    phone: (src ? CHANNEL.phones[src] : null) ?? CHANNEL.phones.default,
    offer: src === "meta" && CHANNEL.metaOffer ? CHANNEL.metaOffer : null,
  };
}

/**
 * Share card for this page only.
 *
 * The sitewide card (`images.share`) is the blue 911 in the bay — a detailing
 * photo, which is the wrong promise on a tint page and on any link to it that
 * gets texted or posted. This one is Angelo's own windshield install, cropped
 * to 1200x630 from the shop's gallery.
 */
const SHARE_IMAGE = `${site.url}/img/window-tint-windshield-share.jpg`;
const SHARE_ALT =
  "Evo Solutions installer working window film across the inside of a front windshield";

export const Route = createFileRoute("/tint")({
  head: () => ({
    ...seoNoIndex(),
  }),
  component: TintLanding,
});

/** Ad landing pages get full metadata but are kept out of the index. */
function seoNoIndex() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${site.url}${PATH}` },
      { property: "og:site_name", content: site.business.name },
      // Overrides the sitewide card in __root.tsx — deepest route wins.
      { property: "og:image", content: SHARE_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SHARE_ALT },
      { name: "twitter:image", content: SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${site.url}${PATH}` }],
  };
}

function TintLanding() {
  // Live prices from ShopFlow — the only price source this repo allows.
  // Every price element below renders nothing when this is null.
  const pricing = usePricing();

  // Google's ceramic ads land on /tint#ceramic: the browser scrolls to the
  // comparison and both forms preselect ceramic, so the page answers the
  // exact query the click came from. Read post-mount — hashes don't reach
  // the server, and the SSR HTML must match the first client render.
  const [presetTier, setPresetTier] = useState<TintTier | null>(null);
  useEffect(() => {
    if (window.location.hash.toLowerCase() !== "#ceramic") return;
    setPresetTier("ceramic");
    // The router's scroll restoration wins the race against the native anchor
    // jump on a fresh load, so jump explicitly once layout exists. Instant on
    // purpose: the sitewide scroll-behavior:smooth animation stalls when it
    // races hydration, and an arrival jump shouldn't animate anyway (a 4,500px
    // glide on page load is exactly what prefers-reduced-motion is about).
    // Twice: the cv-auto sections above only get real heights once they've
    // been scrolled past, so the first jump lands short. The second is
    // idempotent — a no-op when the first one already landed clean.
    const jump = () => document.getElementById("ceramic")?.scrollIntoView({ behavior: "instant" });
    requestAnimationFrame(jump);
    const settle = setTimeout(jump, 500);
    return () => clearTimeout(settle);
  }, []);

  const { phone, offer } = useChannel();
  const [offerDismissed, setOfferDismissed] = useState(false);

  useEffect(() => {
    trackLandingView("Window tint");
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {offer && !offerDismissed && (
        <OfferBar text={offer} onDismiss={() => setOfferDismissed(true)} />
      )}
      <LandingHeader phone={phone} />
      <main id="main" className="pb-24 lg:pb-0">
        <HeroWithForm pricing={pricing} presetTier={presetTier} phone={phone} />
        <TheCost />
        <TheOffer />
        <CarbonVsCeramic pricing={pricing} />
        <Guarantee />
        <Proof />
        <Objections />
        <Close presetTier={presetTier} phone={phone} />
      </main>
      <StickyBar phone={phone} />
    </div>
  );
}

/**
 * The Meta offer bar. Confirms the offer the ad promised — nothing more — and
 * dismisses for the pageview. Existing tokens only: accent-soft wash on the
 * page background, standard borders.
 */
function OfferBar({ text, onDismiss }: { text: string; onDismiss: () => void }) {
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

/* ================================================================ header == */

/**
 * A logo and a phone number. No navigation — there is nowhere else to go, by
 * design. The phone number is the one competing call to action, and it earns
 * its place: on paid mobile traffic a call is worth more than a form fill.
 */
function LandingHeader({ phone }: { phone: ChannelPhone }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
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
        </div>
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

/* ================================================================== hero == */

function HeroWithForm({
  pricing,
  presetTier,
  phone,
}: {
  pricing: Pricing | null;
  presetTier: TintTier | null;
  phone: ChannelPhone;
}) {
  const heroSrc = useSiteImage("service_tint", images.service.service_tint.webp);
  const isBundled = heroSrc === images.service.service_tint.webp;
  const fromPrice = startingAt(pricing, "window-tint");

  return (
    <section className="relative isolate overflow-hidden">
      {/* The shop's own tint photo, dimmed hard. On a page this text-heavy the
          photo's job is atmosphere and proof-of-real-shop, not decoration —
          so it never competes with the headline for contrast. */}
      <div className="absolute inset-0 -z-10">
        {isBundled ? (
          <picture>
            <source type="image/avif" srcSet={images.service.service_tint.avif} />
            <img
              src={heroSrc}
              alt=""
              width={images.service.service_tint.width}
              height={images.service.service_tint.height}
              fetchPriority="high"
              decoding="sync"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        ) : (
          <img
            src={heroSrc}
            alt=""
            fetchPriority="high"
            decoding="sync"
            className="h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>

      <div className="container-x grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div>
          <p className="eyebrow">Albuquerque · Window Tint</p>

          {/* The rating leads. A search visitor is comparing three shops in
              three tabs, and this is the fact that decides it — it can't live
              below the CTAs where only Meta scrollers ever saw it. */}
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="flex" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </span>
            <span className="font-semibold">{site.reviews.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">· {site.reviews.count} Google reviews</span>
          </p>

          <h1 className="mt-4 text-[clamp(2.4rem,6.4vw,4.1rem)]">
            Block <span className="text-accent">99% of the UV.</span>
            <br />
            Cut up to <span className="text-accent">65% of the heat.</span>
          </h1>

          {/* The live from-price. Price shoppers are the biggest source of
              wasted paid clicks: hiding the floor means paying ~$5 for people
              who were never going to spend $400+. A starting point, not a
              quote — the flat number still comes by text. */}
          {fromPrice != null && (
            <p className="mt-4 text-[0.9375rem]">
              <span className="font-display font-semibold text-accent">
                Full vehicle from {money(fromPrice)}
              </span>{" "}
              <span className="text-muted-foreground">— exact flat price for your car by text</span>
            </p>
          )}

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Ceramic and carbon film, installed at our shop on Vista Alameda and backed by a{" "}
            <strong className="font-semibold text-foreground">lifetime warranty on the film</strong>
            . Tell us what you drive and we'll come back with a flat price — no deposit, no
            obligation.
          </p>

          {/* Three numbers, stated once, big. Everything below this fold is
              evidence for them. */}
          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            <Stat value={`${specs.ceramic.uv}%`} label="Harmful UV blocked" />
            <Stat value={`${specs.ceramic.heat}%`} label="Heat rejected — ceramic" />
            <Stat value="Lifetime" label="Warranty on the film" />
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#quote"
              onClick={() => trackQuoteClick("landing-hero", "Window tint")}
              className="btn btn-primary btn-lg"
            >
              Get My Tint Price
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={phone.href}
              onClick={() => trackPhoneClick("landing-hero")}
              className="btn btn-ghost btn-lg"
            >
              <Phone className="h-4 w-4" />
              {phone.display}
            </a>
          </div>

          {/* Trust strip — the rating moved above the H1, so this slot now
              carries the rest: warranty, the actual film brands, locality.
              Years in business is deliberately absent: it's unverified (see
              site.unverified) and this site publishes nothing unsourced. */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Lifetime film warranty
            </span>
            <span>{site.filmBrands.join(" & ")} film</span>
            <span>Locally owned</span>
            <span>Walk-ins welcome Mon–Sat</span>
          </div>

          {/* The three objections that stop a cold visitor from filling the
              form, answered before they scroll far enough to have them. */}
          <ul className="mt-8 max-w-lg space-y-3 border-t border-border pt-7">
            {[
              "Both tiers block 99% of harmful UV — the part that cracks dashboards and fades leather.",
              "Ceramic rejects up to 65% of the heat. Carbon rejects 20%. Neither ever turns purple.",
              "Installed in our own bay, and warrantied for life against bubbling, peeling and colour change.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* On desktop the form sits beside the headline — nobody should have to
            scroll to find the thing the ad promised. On mobile it follows
            immediately, which tests better than a form buried below proof. */}
        <div className="lg:pt-6">
          <LandingLeadForm presetTier={presetTier} phone={phone} />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  // flex-col-reverse so the number reads first visually while the markup keeps
  // the term-then-definition order a <dl> requires — one label, not two.
  return (
    <div className="flex flex-col-reverse rounded-lg border border-border bg-surface/70 p-3.5 text-center sm:p-4">
      <dt className="mt-2 text-[0.6875rem] leading-tight text-muted-foreground sm:text-xs">
        {label}
      </dt>
      {/* Min sized so the longest value ("Lifetime") still clears the frame
          in a three-up grid at 375px. */}
      <dd className="font-display text-[clamp(1.25rem,4.4vw,2.15rem)] font-bold leading-none tracking-tight text-accent">
        {value}
      </dd>
    </div>
  );
}

/* ================================================================== cost == */

function TheCost() {
  const costs = TINT?.problem.costs ?? [];

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">The part nobody quotes you for</p>
          <h2 className="mt-3 max-w-3xl">
            Untinted glass isn't neutral. It's costing you every day the car sits outside.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Albuquerque sits at 5,300 feet. Thinner air means the sun comes through harder here than
            it does at sea level — and the damage is cumulative, not dramatic. That's exactly why it
            gets ignored.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {costs.map((c, i) => (
            <Reveal
              key={c.label}
              delay={i * 60}
              className="rounded-lg border border-border bg-surface/50 p-6"
            >
              <h3 className="text-[1.0625rem] font-semibold">{c.label}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {c.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================= offer == */

/**
 * The value stack. Prices are not on this site by policy, so the stack is
 * built out of what's actually included rather than an invented "$X value"
 * column — which is the honest version of the same device, and the one that
 * survives a customer comparing it to what they're quoted.
 */
function TheOffer() {
  const included = TINT?.included ?? [];

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">What you're actually getting</p>
            <h2 className="mt-3">Every install includes all of it.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not tiers of service. One standard, on a Civic or a 911 — the only thing that changes
              is the film you pick and how much glass there is.
            </p>

            <ul className="mt-8 space-y-3.5">
              {included.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                  <span className="text-[0.9375rem] leading-relaxed">{item}</span>
                </li>
              ))}
              <li className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                <span className="text-[0.9375rem] leading-relaxed">
                  <strong className="font-semibold">{specs.warranty}</strong> — bubbling, peeling,
                  cracking and colour change are covered
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel overflow-hidden">
              <Photo
                src={images.service.service_ppf.webp}
                avif={images.service.service_ppf.avif}
                alt={images.service.service_ppf.alt}
                ratio="16/10"
                className="rounded-none"
              />
              <div className="p-6 sm:p-7">
                <h3>Installed in our own bay. Not a driveway.</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  The car comes inside, the glass gets cleaned and decontaminated before any film
                  touches it, and the film is cut to your vehicle's exact window pattern. That prep
                  is the difference between film that lasts and film that lifts at the edges in two
                  summers.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {site.business.address} · Mon–Sat 10–6
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ comparison == */

function CarbonVsCeramic({ pricing }: { pricing: Pricing | null }) {
  const carbonFrom = tintTierRange(pricing, "carbon")?.min ?? null;
  const ceramicFrom = tintTierRange(pricing, "ceramic")?.min ?? null;

  const rows: { label: string; carbon: string; ceramic: string }[] = [
    {
      label: "Harmful UV blocked",
      carbon: `${specs.carbon.uv}%`,
      ceramic: `${specs.ceramic.uv}%`,
    },
    {
      label: "Heat rejected",
      carbon: `${specs.carbon.heat}%`,
      ceramic: `${specs.ceramic.heat}%`,
    },
    { label: "Colour-stable (never purples)", carbon: "yes", ceramic: "yes" },
    { label: "Cuts glare", carbon: "yes", ceramic: "yes" },
    { label: "Blocks infrared — the heat you feel", carbon: "some", ceramic: "yes" },
    {
      label: "Best for",
      carbon: "Garage-kept daily drivers",
      ceramic: "Cars parked outside, dark paint, kids in the back",
    },
    { label: specs.warranty, carbon: "yes", ceramic: "yes" },
  ];

  return (
    // Anchored so ceramic-keyword ads can land on /tint#ceramic and arrive at
    // a section that names their exact search. scroll-mt clears the sticky
    // header when the browser jumps here.
    <section id="ceramic" className="section-y-tight cv-auto scroll-mt-20 border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Two tiers, one honest difference</p>
          <h2 className="mt-3 max-w-3xl">
            Ceramic tint vs. carbon — both look the same from the street.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A 20% carbon and a 20% ceramic are the same shade to anyone looking at your car. The
            difference is what happens inside it in August — {specs.carbon.heat}% of the sun's heat
            stopped, or {specs.ceramic.heat}%.
          </p>
        </Reveal>

        <Reveal className="mt-9 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">Carbon and ceramic window film compared</caption>
            <thead>
              <tr className="border-b border-line-strong">
                <th
                  scope="col"
                  className="w-2/5 py-4 pr-4 text-sm font-normal text-muted-foreground"
                >
                  &nbsp;
                </th>
                <th scope="col" className="px-3 py-4 align-bottom">
                  <span className="block font-display text-lg font-bold">Carbon</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    The value pick
                  </span>
                </th>
                <th scope="col" className="rounded-t-md bg-accent-soft px-3 py-4 align-bottom">
                  <span className="block font-display text-lg font-bold text-accent">Ceramic</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    What most people leave with
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Live ShopFlow from-prices, framed as a floor. Rendered only
                  with data — a missing price is fine, a wrong one is not. */}
              {(carbonFrom != null || ceramicFrom != null) && (
                <tr className="border-b border-border">
                  <th scope="row" className="py-3.5 pr-4 text-[0.9375rem] font-normal">
                    Starting price — full vehicle
                  </th>
                  <Cell value={carbonFrom != null ? `from ${money(carbonFrom)}` : "—"} />
                  <Cell
                    value={ceramicFrom != null ? `from ${money(ceramicFrom)}` : "—"}
                    highlight
                  />
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border">
                  <th scope="row" className="py-3.5 pr-4 text-[0.9375rem] font-normal">
                    {r.label}
                  </th>
                  <Cell value={r.carbon} />
                  <Cell value={r.ceramic} highlight />
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <Reveal className="mt-7">
          <a
            href="#quote"
            onClick={() => trackQuoteClick("landing-comparison", "Window tint")}
            className="btn btn-primary"
          >
            Price both for my car
            <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Cell({ value, highlight = false }: { value: string; highlight?: boolean }) {
  const bg = highlight ? "bg-accent-soft" : "";
  if (value === "yes" || value === "some") {
    return (
      <td className={`px-3 py-3.5 ${bg}`}>
        {value === "yes" ? (
          <>
            <Check className="h-5 w-5 text-accent" strokeWidth={2.5} aria-hidden />
            <span className="sr-only">Yes</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Some</span>
        )}
      </td>
    );
  }
  return (
    <td className={`px-3 py-3.5 text-[0.9375rem] ${bg} ${highlight ? "font-semibold" : ""}`}>
      {value}
    </td>
  );
}

/* ============================================================= guarantee == */

function Guarantee() {
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal className="panel mx-auto max-w-3xl border-accent/35 p-7 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
            <ShieldCheck className="h-7 w-7 text-accent" />
          </div>
          <h2 className="mt-6 text-[clamp(1.7rem,3.6vw,2.4rem)]">{specs.warranty}.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Cheap dyed film fades to purple and bubbles in this climate, usually inside two summers.
            Ours doesn't — and if it ever bubbles, peels, cracks or changes colour, it's covered.
            That's the whole risk of saying yes, and we're carrying it.
          </p>
          <a
            href="#quote"
            onClick={() => trackQuoteClick("landing-guarantee", "Window tint")}
            className="btn btn-primary btn-lg mt-8"
          >
            Get My Tint Price
            <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================= proof == */

/**
 * Reviews are the three real Google reviews in content/reviews.ts, and the
 * photos are whatever tint work Angelo has uploaded to ShopFlow — so the proof
 * on this page updates when the shop's own gallery does, with the bundled
 * photos as the fallback.
 */
function Proof() {
  const { photos } = useShopGallery();
  const [shown, setShown] = useState<{ url: string; alt: string; ratio: string }[]>([]);

  useEffect(() => {
    const tint = photos.filter((p) => p.tag === "tint").slice(0, 3);
    if (tint.length) {
      // One ratio across the row, not each photo's own. The shop's uploads are
      // a mix of portrait, square and 16:9 phone shots; rendered at their
      // intrinsic ratios they make a ragged three-up. Letterboxed screenshots
      // keep their 3/4 frame, which is what trims the baked-in black bars.
      setShown(
        tint.map((p) => ({
          url: p.url,
          alt: p.alt,
          ratio: p.letterboxed ? "3/4" : "4/3",
        })),
      );
    }
  }, [photos]);

  const fallback = [
    { url: images.service.service_tint.webp, alt: images.service.service_tint.alt, ratio: "4/3" },
    { url: images.hero.webp, alt: images.hero.alt, ratio: "4/3" },
    {
      url: images.service.service_detail.webp,
      alt: images.service.service_detail.alt,
      ratio: "4/3",
    },
  ];
  const gallery = shown.length ? shown : fallback;

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">18 reviews, 5.0 stars</p>
          <h2 className="mt-3 max-w-3xl">Albuquerque drivers, in their own words.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {site.business.name} traded as {site.business.formerName} until the 2026 rebrand — same
            owner, same crew, same Google profile, which is why some of these mention detailing.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal
              key={r.id}
              delay={i * 60}
              className="flex flex-col rounded-lg border border-border bg-surface/50 p-6"
            >
              <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[1.0625rem] leading-relaxed">
                “{r.quote}”
              </blockquote>
              <footer className="mt-5 border-t border-border pt-4 text-sm">
                <cite className="font-medium not-italic">{r.name}</cite>
                <span className="block text-xs text-muted-foreground">via {r.source}</span>
              </footer>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {gallery.map((g, i) => (
            <Reveal key={g.url} delay={i * 60}>
              <Photo src={g.url} alt={g.alt} ratio={g.ratio} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ objections == */

/**
 * The five things people actually stall on. Answers are lifted from the tint
 * service page so the two can't contradict each other — with the legal one
 * first, because "is this even legal here" is the most common stall.
 */
function Objections() {
  const faqs = (TINT?.faqs ?? []).filter((f) =>
    [
      "How dark can I legally go in New Mexico?",
      "What percentage should I actually pick?",
      "Does ceramic tint really reduce heat, or is that marketing?",
      "How long before I can roll my windows down?",
      "Can you remove my old tint?",
    ].includes(f.q),
  );

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Before you ask</p>
          <h2 className="mt-3">Straight answers.</h2>
        </Reveal>

        <div className="mt-9 grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <h3 className="text-[1.0625rem] font-semibold">{f.q}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">{f.a}</p>
            </Reveal>
          ))}
        </div>

        {/* Expectation setting, straight from the service page. It reads as a
            negative and converts as a positive — a shop that tells you what
            film won't do is a shop you believe about what it will. */}
        {TINT?.truths && (
          <Reveal className="mt-12 grid gap-6 rounded-lg border border-border bg-surface/50 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h3 className="font-display text-base font-semibold">What tint does</h3>
              <ul className="mt-4 space-y-2.5">
                {TINT.truths.does.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[0.9375rem]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold">What it won't do</h3>
              <ul className="mt-4 space-y-2.5">
                {TINT.truths.doesNot.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[0.9375rem] text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-faint-foreground" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ================================================================= close == */

function Close({ presetTier, phone }: { presetTier: TintTier | null; phone: ChannelPhone }) {
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <h2>Tell us what you drive.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Year, make, model, and what's bothering you. You'll get a shade recommendation and a
              flat number back — usually the same day during shop hours.
            </p>

            <ul className="mt-8 space-y-4 text-[0.9375rem]">
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <a
                  href={phone.href}
                  onClick={() => trackPhoneClick("landing-close")}
                  className="font-semibold text-accent underline underline-offset-4"
                >
                  {phone.display}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  {site.business.address}
                  <span className="block text-muted-foreground">
                    Mon–Sat 10:00 AM – 6:00 PM · Walk-ins welcome
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  {specs.warranty} · {specs.ceramic.uv}% UV blocked on both tiers
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={80}>
            {/* A second live form rather than a link back up the page — on a
                long page, scrolling someone 4,000px to a form they already
                passed is where leads die. Both post to the same place. */}
            <LandingLeadForm id="quote-close" presetTier={presetTier} phone={phone} />
          </Reveal>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.business.name}. {site.business.address}. Performance
          figures are the film manufacturer's for the tiers we install; actual results vary by
          vehicle, glass and shade selected.
        </p>
      </div>
    </section>
  );
}

/* ============================================================ sticky bar == */

/**
 * The phone-only action bar. It stays hidden until the hero's own buttons are
 * behind the visitor, and hides again whenever either form is on screen —
 * pointing at something someone is already looking at just costs them a tap
 * target at the bottom of the page.
 */
function StickyBar({ phone }: { phone: ChannelPhone }) {
  const { past, sentinel } = useScrolledPast("70vh");
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = ["quote", "quote-close"]
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
  }, []);

  const shown = past && !formInView;

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
            href="#quote-close"
            onClick={() => trackQuoteClick("landing-sticky", "Window tint")}
            tabIndex={shown ? undefined : -1}
            className="btn btn-primary flex-[1.4]"
          >
            Get My Tint Price
          </a>
        </div>
      </div>
    </>
  );
}
