import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, Phone, ShieldCheck, Star, X } from "lucide-react";

import { LandingHeader, OfferBar, StickyBar } from "@/components/site/LandingChrome";
import { LandingLeadForm } from "@/components/site/LandingLeadForm";
import { Photo } from "@/components/site/Photo";
import { Reveal } from "@/components/site/Reveal";
import { images } from "@/config/images";
import { site } from "@/config/site";
import { ppfImpactZones, ppfLanding } from "@/content/landing";
import { reviews } from "@/content/reviews";
import { serviceBySlug } from "@/content/services";
import { trackLandingView, trackPhoneClick, trackQuoteClick } from "@/lib/analytics";
import { useChannel, type ChannelPhone } from "@/lib/channel";
import { money, ppfRange, usePricing, type Pricing } from "@/lib/pricing";
import { useShopGallery, useSiteImage } from "@/lib/shopGallery";

/**
 * /ppf — the paid-search landing page for paint protection film.
 *
 * Not a service page. `paint-protection-film.tsx` is the SEO page: it
 * explains, it links out, it earns rankings. This page has one job, one exit,
 * and one thing to click — the same contract as /tint, tuned for a different
 * visitor. A Google search click ("paint protection film albuquerque", "clear
 * bra", "ppf cost") is a comparison shopper with three tabs open, not a Meta
 * scroller who needs to be told what film is. So:
 *
 *   • The facts that decide a comparison sit above the fold: rating, live
 *     from-price, phone number, the film brands, and a form.
 *   • Coverage — the only real decision in PPF — is the second screen, with
 *     each option a one-tap preset into the form. Ad groups can land on
 *     /ppf#full-front etc. and arrive at a page that names their query.
 *   • No nav, no footer links, noindex. Every outbound link is a leak in a
 *     page you're paying per click to fill.
 *
 * Claims: PPF has NO owner-supplied warranty or performance figure yet
 * (site.ppfSpecs). The page describes what urethane film does — impact,
 * self-healing, removable — and quotes no number it can't source. Prices are
 * live from ShopFlow (lib/pricing.ts); the guarantee section renders only once
 * `site.ppfSpecs.warranty` is set.
 */

const PATH = "/ppf";
const TITLE = "Paint Protection Film (Clear Bra) in Albuquerque — Evo Solutions";
const DESC =
  "Self-healing paint protection film, cut to your exact model and installed in our own Albuquerque bay. Stop rock chips from I-25 and I-40 before they start. Flat price by text.";

const PPF = serviceBySlug("paint-protection-film");
const specs = site.ppfSpecs;
const SERVICE = ppfLanding.leadValue; // analytics label — matches the CRM tag
const CTA = ppfLanding.form.cta;

/** Arrival anchors an ad group can use; each preselects the matching chip. */
const COVERAGE_HASHES = ["partial-front", "full-front", "extended", "full-body"] as const;

/**
 * Share card for this page only: Angelo's own crew laying film across the
 * Cadillac CT4-V hood, cropped to 1200x630 from the shop's gallery.
 */
const SHARE_IMAGE = `${site.url}/img/paint-protection-film-share.jpg`;
const SHARE_ALT =
  "Three Evo Solutions technicians laying paint protection film across the hood of a gold Cadillac CT4-V";

export const Route = createFileRoute("/ppf")({
  head: () => ({ ...seoNoIndex() }),
  component: PpfLanding,
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

function PpfLanding() {
  // Live prices from ShopFlow — the only price source this repo allows.
  // Every price element below renders nothing when this is null.
  const pricing = usePricing();

  // The coverage preset feeds both forms. It comes from the arrival hash
  // (/ppf#full-front from a "full front ppf" ad group) or from a coverage
  // card tap; the key bumps so tapping the same card again still re-applies.
  const [preset, setPreset] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState(0);
  const pick = (key: string) => {
    setPreset(key);
    setPresetKey((n) => n + 1);
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1).toLowerCase();
    const coverage = (COVERAGE_HASHES as readonly string[]).includes(hash);
    if (coverage) setPreset(hash);
    if (!coverage && hash !== "coverage") return;
    // The router's scroll restoration wins the race against the native anchor
    // jump on a fresh load, so jump explicitly once layout exists — instant,
    // and twice, for the reasons documented on /tint (cv-auto sections above
    // only get real heights once they've been scrolled past).
    const jump = () => document.getElementById("coverage")?.scrollIntoView({ behavior: "instant" });
    requestAnimationFrame(jump);
    const settle = setTimeout(jump, 500);
    return () => clearTimeout(settle);
  }, []);

  const { phone, offer } = useChannel();
  const [offerDismissed, setOfferDismissed] = useState(false);

  useEffect(() => {
    trackLandingView(SERVICE);
  }, []);

  const formProps = { variant: ppfLanding, preset, presetKey, phone };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {offer && !offerDismissed && (
        <OfferBar text={offer} onDismiss={() => setOfferDismissed(true)} />
      )}
      <LandingHeader phone={phone} />
      <main id="main" className="pb-24 lg:pb-0">
        <HeroWithForm pricing={pricing} phone={phone} form={formProps} />
        <Coverage pricing={pricing} onPick={pick} />
        <TheProblem />
        <TheOffer />
        <Truths />
        {specs.warranty && <Guarantee text={specs.warranty} />}
        <Proof />
        <Objections />
        <Close phone={phone} form={formProps} />
      </main>
      <StickyBar phone={phone} cta={CTA} service={SERVICE} />
    </div>
  );
}

type FormProps = {
  variant: typeof ppfLanding;
  preset: string | null;
  presetKey: number;
  phone: ChannelPhone;
};

/* ================================================================== hero == */

function HeroWithForm({
  pricing,
  phone,
  form,
}: {
  pricing: Pricing | null;
  phone: ChannelPhone;
  form: FormProps;
}) {
  const heroSrc = useSiteImage("service_ppf", images.service.service_ppf.webp);
  const isBundled = heroSrc === images.service.service_ppf.webp;
  const range = ppfRange(pricing);

  return (
    <section className="relative isolate overflow-hidden">
      {/* The shop's own PPF install, dimmed hard: atmosphere and proof of a
          real bay, never competing with the headline for contrast. */}
      <div className="absolute inset-0 -z-10">
        {isBundled ? (
          <picture>
            <source type="image/avif" srcSet={images.service.service_ppf.avif} />
            <img
              src={heroSrc}
              alt=""
              width={images.service.service_ppf.width}
              height={images.service.service_ppf.height}
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
          {/* Names the query. "Clear bra" is what half of Albuquerque still
              searches for, so it's in the first line of text, not buried. */}
          <p className="eyebrow">Albuquerque · Paint Protection Film · Clear Bra</p>

          {/* The rating leads. A search visitor is comparing three shops in
              three tabs, and this is the fact that decides it. */}
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
            Rock chips stop at <span className="text-accent">the film.</span>
            <br />
            Not at your paint.
          </h1>

          {/* The live from-price. Price shoppers are the biggest source of
              wasted paid clicks on a four-figure service: hiding the floor
              means paying for people who were never going to spend it. A
              starting point, not a quote — the flat number comes by text. */}
          {range && (
            <p className="mt-4 text-[0.9375rem]">
              <span className="font-display font-semibold text-accent">
                Standard front coverage from {money(range.min)}
              </span>{" "}
              <span className="text-muted-foreground">— exact flat price for your car by text</span>
            </p>
          )}

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Self-healing urethane film, cut to your exact model and installed in our own bay on
            Vista Alameda. Tell us what you drive and how you drive it — we'll come back with the
            coverage we'd actually recommend and a{" "}
            <strong className="font-semibold text-foreground">flat price</strong>. No deposit, no
            obligation.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#quote"
              onClick={() => trackQuoteClick("landing-hero", SERVICE)}
              className="btn btn-primary btn-lg"
            >
              {CTA}
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

          {/* Trust strip: the actual film brands, locality, hours. Warranty and
              years in business are deliberately absent — both unverified for
              PPF (site.ppfSpecs / site.unverified). */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Self-healing film
            </span>
            <span>{site.filmBrands.join(" & ")} film</span>
            <span>Locally owned</span>
            <span>Walk-ins welcome Mon–Sat</span>
          </div>

          {/* The three things a cold visitor needs to believe before the form
              is worth filling in — answered before they scroll. */}
          <ul className="mt-8 max-w-lg space-y-3 border-t border-border pt-7">
            {[
              "Thick urethane takes the stone instead of your clear coat. That's the whole product in one sentence.",
              "Light scratches and swirls in the film close back up with heat — a hot Albuquerque afternoon does it.",
              "Comes off years later leaving factory paint. Original paint is what an appraiser pays for.",
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
            immediately. */}
        <div className="lg:pt-6">
          <LandingLeadForm {...form} />
        </div>
      </div>
    </section>
  );
}

/* ============================================================== coverage == */

/**
 * The decision. PPF has one variable that moves the price and the outcome —
 * how many panels get film — and a visitor who understands it in thirty
 * seconds fills the form with a real answer instead of "not sure". Each card
 * is a one-tap preset into the form.
 */
function Coverage({ pricing, onPick }: { pricing: Pricing | null; onPick: (key: string) => void }) {
  const items = PPF?.options?.items ?? [];
  const range = ppfRange(pricing);

  return (
    <section id="coverage" className="section-y-tight cv-auto scroll-mt-20 border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">The only real decision</p>
          <h2 className="mt-3 max-w-3xl">How much of the car gets film?</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{PPF?.options?.intro}</p>
          {/* Live ShopFlow prices, framed as the standard job by vehicle size.
              Rendered only with data — a missing price is fine, a wrong one
              is not. Extended and full body are never priced on the page. */}
          {range && (
            <p className="mt-5 text-[0.9375rem]">
              <span className="font-display font-semibold text-accent">
                Standard front coverage {money(range.min)}–{money(range.max)}
              </span>{" "}
              <span className="text-muted-foreground">
                by vehicle size. Extended and full-body packages are quoted per car — no two are the
                same shape.
              </span>
            </p>
          )}
        </Reveal>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {items.map((o, i) => {
            const key = COVERAGE_HASHES[i] ?? o.name.toLowerCase().replace(/\W+/g, "-");
            const featured = o.name === "Full front";
            return (
              <Reveal
                key={o.name}
                delay={i * 60}
                className={`flex flex-col rounded-lg border p-6 ${
                  featured ? "border-accent/50 bg-accent-soft" : "border-border bg-surface/50"
                }`}
              >
                <p className={`eyebrow ${featured ? "" : "text-muted-foreground"}`}>{o.tag}</p>
                <h3 className="mt-2 text-xl font-semibold">{o.name}</h3>
                <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {o.body}
                </p>
                <p className="mt-4 text-sm">
                  <span className="text-muted-foreground">Best for: </span>
                  {o.bestFor}
                </p>
                <a
                  href="#quote"
                  onClick={() => {
                    onPick(key);
                    trackQuoteClick("landing-coverage", SERVICE);
                  }}
                  className={`mt-5 ${featured ? "btn btn-primary" : "btn btn-ghost"}`}
                >
                  Price {o.name.toLowerCase()} for my car
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =============================================================== problem == */

function TheProblem() {
  const costs = PPF?.problem.costs ?? [];

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Why front ends look old first</p>
          <h2 className="mt-3 max-w-3xl">Chips aren't bad luck. They land in the same places.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{PPF?.problem.body}</p>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="grid gap-4 sm:grid-cols-2">
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

          {/* The impact map. Concrete beats abstract: a visitor who recognises
              their own bumper in this list has just been sold. */}
          <Reveal delay={80}>
            <h3 className="font-display text-base font-semibold">Where it lands, in order</h3>
            <ol className="mt-4 border-t border-border">
              {ppfImpactZones.map((z, i) => (
                <li
                  key={z.zone}
                  className="grid grid-cols-[2rem_1fr] gap-4 border-b border-border py-3.5"
                >
                  <span className="font-display text-sm font-bold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-display font-semibold">{z.zone}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{z.note}</span>
                  </span>
                </li>
              ))}
            </ol>
            <a
              href="#coverage"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
            >
              Match coverage to where you're getting hit
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================= offer == */

/**
 * The value stack, built from what's actually included rather than an
 * invented "$X value" column — the honest version of the same device, and
 * the one that survives a customer comparing it to a cheaper quote.
 */
function TheOffer() {
  const included = PPF?.included ?? [];

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">What you're actually getting</p>
            <h2 className="mt-3">Every film job includes all of it.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One standard, on a Civic or a 911. The only things that change are how many panels get
              film and how much paint there is to prep.
            </p>

            <ul className="mt-8 space-y-3.5">
              {included.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                  <span className="text-[0.9375rem] leading-relaxed">{item}</span>
                </li>
              ))}
              {specs.warranty && (
                <li className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                  <span className="text-[0.9375rem] leading-relaxed">
                    <strong className="font-semibold">{specs.warranty}</strong>
                  </span>
                </li>
              )}
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
                <h3>Cut to your model. Installed indoors.</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  Film magnifies whatever is under it, so the paint is washed, decontaminated and
                  inspected first — and any existing chips are pointed out before we start, not
                  after. Panels are laid wet, squeegeed out and the edges wrapped wherever the panel
                  allows, in our own bay with the door shut. A visible seam across the middle of a
                  hood is an install problem, not a film problem, and you won't get one here.
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

/* ================================================================ truths == */

/**
 * Expectation setting, straight from the service page so the two can't
 * contradict each other. It reads as a negative and converts as a positive —
 * a shop that tells you what film won't do is a shop you believe about what
 * it will. The PPF-vs-coating answer sits here because "ppf vs ceramic" is a
 * search of its own, and the answer is a reason to fill the form, not to
 * leave for a guide.
 */
function Truths() {
  const truths = PPF?.truths;
  const versus = PPF?.faqs.find((f) => f.q === "PPF or ceramic coating?");

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Straight answers</p>
          <h2 className="mt-3 max-w-3xl">What film will and won't stop.</h2>
        </Reveal>

        {truths && (
          <Reveal className="mt-9 grid gap-6 rounded-lg border border-border bg-surface/50 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h3 className="font-display text-base font-semibold">What film does</h3>
              <ul className="mt-4 space-y-2.5">
                {truths.does.map((t) => (
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
                {truths.doesNot.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[0.9375rem] text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-faint-foreground" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {versus && (
          <Reveal className="mt-6 flex flex-col gap-5 rounded-lg border border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="max-w-2xl">
              <h3 className="text-[1.0625rem] font-semibold">{versus.q}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {versus.a} Want both? Say so in the form and we'll price them together.
              </p>
            </div>
            <a
              href="#quote"
              onClick={() => trackQuoteClick("landing-versus", SERVICE)}
              className="btn btn-ghost shrink-0"
            >
              Price film for my car
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ============================================================= guarantee == */

/** Renders only once Angelo supplies the manufacturer's PPF warranty terms. */
function Guarantee({ text }: { text: string }) {
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal className="panel mx-auto max-w-3xl border-accent/35 p-7 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
            <ShieldCheck className="h-7 w-7 text-accent" />
          </div>
          <h2 className="mt-6 text-[clamp(1.7rem,3.6vw,2.4rem)]">{text}.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Old film yellowed and cracked. The film we install carries the manufacturer's written
            warranty, and you get that document with the quote — in writing, not our word.
          </p>
          <a
            href="#quote"
            onClick={() => trackQuoteClick("landing-guarantee", SERVICE)}
            className="btn btn-primary btn-lg mt-8"
          >
            {CTA}
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
 * photos are whatever PPF work Angelo has uploaded to ShopFlow — so the proof
 * on this page updates when the shop's own gallery does, with the bundled
 * photos as the fallback.
 */
function Proof() {
  const { photos } = useShopGallery();
  const [shown, setShown] = useState<{ url: string; alt: string; ratio: string }[]>([]);

  useEffect(() => {
    const ppf = photos.filter((p) => p.tag === "ppf").slice(0, 3);
    if (ppf.length) {
      // One ratio across the row; letterboxed screenshots keep their 3/4
      // frame, which is what trims the baked-in black bars.
      setShown(ppf.map((p) => ({ url: p.url, alt: p.alt, ratio: p.letterboxed ? "3/4" : "4/3" })));
    }
  }, [photos]);

  const fallback = [
    { url: images.service.service_ppf.webp, alt: images.service.service_ppf.alt, ratio: "4/3" },
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
          <p className="eyebrow">
            {site.reviews.count} reviews, {site.reviews.rating.toFixed(1)} stars
          </p>
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
 * The things people actually stall on, lifted from the PPF service page so
 * the two can't contradict each other. "Is it visible" first — it's the
 * objection behind most "I'll think about it".
 */
function Objections() {
  const wanted = [
    "Is it visible?",
    "Will it yellow?",
    "Can you film a car that already has chips?",
    "How long does it take?",
    "Can I wash it normally?",
    "What does PPF actually protect against?",
  ];
  const faqs = wanted
    .map((q) => PPF?.faqs.find((f) => f.q === q))
    .filter((f): f is { q: string; a: string } => !!f);

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
      </div>
    </section>
  );
}

/* ================================================================= close == */

function Close({ phone, form }: { phone: ChannelPhone; form: FormProps }) {
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <h2>Tell us what you drive — and how.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Year, make, model, and where it spends its miles. You'll get a coverage recommendation
              and a flat number back — usually the same day during shop hours.
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
                  {site.filmBrands.join(" & ")} film · cut to your model · installed in our own bay
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={80}>
            {/* A second live form rather than a link back up the page — on a
                long page, scrolling someone 4,000px to a form they already
                passed is where leads die. Both post to the same place. */}
            <LandingLeadForm id="quote-close" {...form} />
          </Reveal>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.business.name}. {site.business.address}. Self-healing
          refers to light surface scratches in the film closing under heat; film does not repair
          chips, gouges or damage to the paint beneath it. Coverage and price are confirmed per
          vehicle.
        </p>
      </div>
    </section>
  );
}
