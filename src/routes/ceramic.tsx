import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, Phone, ShieldCheck, Star, X } from "lucide-react";

import { LandingHeader, OfferBar, StickyBar } from "@/components/site/LandingChrome";
import { LandingLeadForm } from "@/components/site/LandingLeadForm";
import { Photo } from "@/components/site/Photo";
import { Reveal } from "@/components/site/Reveal";
import { images } from "@/config/images";
import { site } from "@/config/site";
import { ceramicLanding, COATING_CONDITION, optionKey } from "@/content/landing";
import { reviews } from "@/content/reviews";
import { serviceBySlug } from "@/content/services";
import { trackLandingView, trackPhoneClick, trackQuoteClick } from "@/lib/analytics";
import { useChannel, type ChannelPhone } from "@/lib/channel";
import { useShopGallery, useSiteImage } from "@/lib/shopGallery";

/**
 * /ceramic — the paid landing page for ceramic coating.
 *
 * Not a service page. `ceramic-coating.tsx` is the SEO page: full nav, footer,
 * related services, guides — every one of them a leak on a page you're paying
 * per click to fill. This page has the same contract as /tint and /ppf: one
 * job, one exit (the logo), noindex, a form in the first screen.
 *
 * What's different about coating: it is quote-only by the owner's decision
 * (2026-09-04), because the price turns on paint condition, not car size. So
 * the qualifying question is the paint's condition, the form offers an
 * optional photo attach on step 2, and no price — live or otherwise — ever
 * renders here. Brand and warranty come from `site.coatingSpecs` (owner-
 * sourced); copy that isn't in there is lifted from the service entry so the
 * two pages can't contradict each other.
 */

const PATH = "/ceramic";
const TITLE = "Ceramic Coating in Albuquerque | Nasiol, Paint Corrected First — Evo Solutions";
const DESC =
  "Nasiol ceramic coating over paint we correct first, installed in our Albuquerque bay. Easier washing, deeper gloss, optional 10-year paint warranty. One flat quote by text.";

const COATING = serviceBySlug("ceramic-coating");
const spec = site.coatingSpecs;
const SERVICE = ceramicLanding.leadValue;
const CTA = ceramicLanding.form.cta;

/** Arrival anchors an ad group can use; each preselects the matching chip. */
const CONDITION_HASHES = COATING_CONDITION.slice(0, 3).map((o) => optionKey(o).split("-")[0]);

export const Route = createFileRoute("/ceramic")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${site.url}${PATH}` },
      { property: "og:site_name", content: site.business.name },
    ],
    links: [{ rel: "canonical", href: `${site.url}${PATH}` }],
  }),
  component: CeramicLanding,
});

function CeramicLanding() {
  // The condition preset feeds both forms — from the arrival hash
  // (/ceramic#new, #swirls, #faded) or a condition card tap; the key bumps so
  // tapping the same card twice still re-applies.
  const [preset, setPreset] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState(0);
  const pick = (key: string) => {
    setPreset(key);
    setPresetKey((n) => n + 1);
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1).toLowerCase();
    if (CONDITION_HASHES.includes(hash)) setPreset(hash);
  }, []);

  const { phone, offer } = useChannel();
  const [offerDismissed, setOfferDismissed] = useState(false);

  useEffect(() => {
    trackLandingView(SERVICE);
  }, []);

  const formProps = { variant: ceramicLanding, preset, presetKey, phone };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {offer && !offerDismissed && (
        <OfferBar text={offer} onDismiss={() => setOfferDismissed(true)} />
      )}
      <LandingHeader phone={phone} />
      <main id="main" className="pb-24 lg:pb-0">
        <HeroWithForm phone={phone} form={formProps} />
        <Condition onPick={pick} />
        <TheProblem />
        <Prep />
        <Truths />
        <Guarantee />
        <Proof />
        <Objections />
        <Close phone={phone} form={formProps} />
      </main>
      <StickyBar phone={phone} cta={CTA} service={SERVICE} />
    </div>
  );
}

type FormProps = {
  variant: typeof ceramicLanding;
  preset: string | null;
  presetKey: number;
  phone: ChannelPhone;
};

/* ================================================================== hero == */

const CERAMIC_POINTS = [
  "Washing gets genuinely easier — dirt and water release instead of clinging.",
  "Swirls are polished out first. A coating seals in whatever is under it, so prep is the product.",
  `${spec.brand}, bonded to the clear coat and measured in years — with an optional ${spec.warranty.label} against ${spec.warranty.covers}.`,
];

function HeroPoints({ className = "" }: { className?: string }) {
  return (
    <ul className={`max-w-lg space-y-3 ${className}`}>
      {CERAMIC_POINTS.map((line) => (
        <li key={line} className="flex gap-3 text-[0.9375rem] leading-relaxed">
          <Check className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function HeroWithForm({ phone, form }: { phone: ChannelPhone; form: FormProps }) {
  const heroSrc = useSiteImage("service_ceramic", images.service.service_ceramic.webp);
  const isBundled = heroSrc === images.service.service_ceramic.webp;

  return (
    <section className="relative isolate overflow-hidden">
      {/* The shop's own coating work, dimmed hard: atmosphere and proof of a
          real bay, never competing with the headline for contrast. */}
      <div className="absolute inset-0 -z-10">
        {isBundled ? (
          <picture>
            <source type="image/avif" srcSet={images.service.service_ceramic.avif} />
            <img
              src={heroSrc}
              alt=""
              width={images.service.service_ceramic.width}
              height={images.service.service_ceramic.height}
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
          <p className="eyebrow">Albuquerque · Ceramic Coating</p>

          {/* The rating leads — a coating shopper is comparing shops and
              this is the fact that decides it. */}
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
            Gloss that survives <span className="text-accent">the high desert.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A {spec.brand} ceramic coating bonded to your clear coat — over paint we've corrected
            first, in our own bay on Vista Alameda. Tell us the car and the paint's condition and
            we'll come back with{" "}
            <strong className="font-semibold text-foreground">one flat number</strong>, not a range.
            No deposit, no obligation.
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

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Optional {spec.warranty.label}
            </span>
            <span>{spec.brand} coating</span>
            <span>Locally owned</span>
            <span>Walk-ins welcome Mon–Sat</span>
          </div>

          {/* On phones these sit under the form: a paid mobile click should
              reach the form in one thumb-scroll. */}
          <HeroPoints className="mt-8 hidden border-t border-border pt-7 lg:block" />
        </div>

        <div className="lg:pt-6">
          <LandingLeadForm {...form} />
          <HeroPoints className="mt-8 lg:hidden" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================= condition == */

/**
 * The decision, reframed. A coating buyer doesn't choose a package — the
 * paint chooses it. Each card is a one-tap preset into the form, and says
 * plainly what that condition means for the job.
 */
const CONDITION_CARDS = [
  {
    key: CONDITION_HASHES[0],
    name: COATING_CONDITION[0],
    body: "Fresh off the lot or garage-kept. A light polish and decontamination, then coating — the lightest prep there is, and the best time to do it.",
    bestFor: "New cars, before the first automatic car wash",
  },
  {
    key: CONDITION_HASHES[1],
    name: COATING_CONDITION[1],
    body: "The haze you see under a gas-station canopy. It gets machine-polished out before anything is sealed — otherwise the coating locks it in and makes it glossy.",
    bestFor: "Daily drivers a year or more old",
    featured: true,
  },
  {
    key: CONDITION_HASHES[2],
    name: COATING_CONDITION[2],
    body: "Chalky, oxidised or water-spotted. A multi-stage correction brings it back first; how far we take it is your call, and it's the biggest lever on the price.",
    bestFor: "Cars that live outside in Albuquerque sun",
  },
];

function Condition({ onPick }: { onPick: (key: string) => void }) {
  return (
    <section id="condition" className="section-y-tight cv-auto scroll-mt-20 border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Why coating quotes vary so much</p>
          <h2 className="mt-3 max-w-3xl">The paint decides the price, not the size of the car.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Two coating quotes for the same car can be far apart because one includes correcting the
            paint and the other doesn't. Pick the closest match — or send photos and we'll tell you.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {CONDITION_CARDS.map((c, i) => (
            <Reveal
              key={c.key}
              delay={i * 60}
              className={`flex flex-col rounded-lg border p-6 ${
                c.featured ? "border-accent/50 bg-accent-soft" : "border-border bg-surface/50"
              }`}
            >
              <h3 className="text-xl font-semibold">{c.name}</h3>
              <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {c.body}
              </p>
              <p className="mt-4 text-sm">
                <span className="text-muted-foreground">Typical: </span>
                {c.bestFor}
              </p>
              <a
                href="#quote"
                onClick={() => {
                  onPick(c.key);
                  trackQuoteClick("landing-condition", SERVICE);
                }}
                className={`mt-5 ${c.featured ? "btn btn-primary" : "btn btn-ghost"}`}
              >
                Quote my car
                <ArrowRight className="h-4 w-4" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================== problem == */

function TheProblem() {
  const costs = COATING?.problem.costs ?? [];

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">{COATING?.problem.title}</p>
          <h2 className="mt-3 max-w-3xl">
            Paint here doesn't die from one thing. It gets ground down by four.
          </h2>
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

/* ================================================================== prep == */

function Prep() {
  const included = COATING?.included ?? [];

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">What you're actually getting</p>
            <h2 className="mt-3">Prep is the product.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A coating is optically clear and bonds to whatever is underneath it. That's why the
              polish comes before the bottle — and why every job includes all of this.
            </p>

            <ul className="mt-8 space-y-3.5">
              {included.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                  <span className="text-[0.9375rem] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel overflow-hidden">
              <Photo
                src={images.service.service_ceramic.webp}
                avif={images.service.service_ceramic.avif}
                alt={images.service.service_ceramic.alt}
                ratio="16/10"
                className="rounded-none"
              />
              <div className="p-6 sm:p-7">
                <h3>If a quote doesn't mention correction, it isn't the same job.</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  The car comes inside, gets decontaminated and polished, and the coating is
                  levelled panel by panel and cured indoors before it goes back out. You leave
                  knowing exactly how to wash it so it lasts.
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
 * Coating is the most oversold product in the industry, and this buyer has
 * usually been promised something impossible elsewhere. Saying what it won't
 * do is what makes the rest of the page believable.
 */
function Truths() {
  const truths = COATING?.truths;
  const versus = COATING?.faqs.find((f) => f.q === "Ceramic coating or PPF?");

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Straight answers</p>
          <h2 className="mt-3 max-w-3xl">What a coating is, and what it isn't.</h2>
        </Reveal>

        {truths && (
          <Reveal className="mt-9 grid gap-6 rounded-lg border border-border bg-surface/50 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h3 className="font-display text-base font-semibold">What a coating does</h3>
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
              <h3 className="font-display text-base font-semibold">What it will not do</h3>
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
                {versus.a} Want both? Say so and we'll quote them together.
              </p>
            </div>
            <a
              href="#quote"
              onClick={() => trackQuoteClick("landing-versus", SERVICE)}
              className="btn btn-ghost shrink-0"
            >
              Quote coating for my car
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ============================================================= guarantee == */

/** Brand + warranty, owner-sourced (site.coatingSpecs). Priced on the quote. */
function Guarantee() {
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal className="panel mx-auto max-w-3xl border-accent/35 p-7 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
            <ShieldCheck className="h-7 w-7 text-accent" />
          </div>
          <p className="eyebrow mt-6">{spec.brand} ceramic coating</p>
          <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)]">
            Want it in writing? Add the {spec.warranty.years}-year paint warranty.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            It covers {spec.warranty.covers} — the hard-water spots and bird droppings that eat into
            unprotected clear coat. It's priced separately from the coating, so you decide whether
            it's worth it for how you use the car. Ask for it on your quote.
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
 * The three real Google reviews plus whatever coating/detail work Angelo has
 * uploaded to ShopFlow, with the bundled photos as the fallback.
 */
function Proof() {
  const { photos } = useShopGallery();
  const [shown, setShown] = useState<{ url: string; alt: string; ratio: string }[]>([]);

  useEffect(() => {
    const work = [
      ...photos.filter((p) => p.tag === "ceramic"),
      ...photos.filter((p) => p.tag === "detail"),
    ].slice(0, 3);
    if (work.length) {
      setShown(work.map((p) => ({ url: p.url, alt: p.alt, ratio: p.letterboxed ? "3/4" : "4/3" })));
    }
  }, [photos]);

  const fallback = [
    {
      url: images.service.service_ceramic.webp,
      alt: images.service.service_ceramic.alt,
      ratio: "4/3",
    },
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
            owner, same crew, same Google profile.
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

function Objections() {
  const wanted = [
    "Is ceramic coating worth it in New Mexico?",
    "How long does it last?",
    "Is there a warranty?",
    "Do I still have to wash it?",
    "Why does prep cost more than the coating?",
    "How do I wash a coated car?",
  ];
  const faqs = wanted
    .map((q) => COATING?.faqs.find((f) => f.q === q))
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
            <h2>Tell us about the paint.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Year, make, model and a couple of daylight photos if you have them. You'll get an
              honest read on what the paint needs and one flat number — usually the same day during
              shop hours. Rather we see it in person? Walk in, Mon–Sat.
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
                  {spec.brand} coating · optional {spec.warranty.label}
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <LandingLeadForm id="quote-close" {...form} />
          </Reveal>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.business.name}. {site.business.address}. The{" "}
          {spec.warranty.label} is an optional add-on priced separately from the coating and covers{" "}
          {spec.warranty.covers}. A coating does not stop rock chips or car-wash scratches.
        </p>
      </div>
    </section>
  );
}
