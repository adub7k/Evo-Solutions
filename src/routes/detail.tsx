import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";

import { BookingForm } from "@/components/site/BookingForm";
import { LandingHeader, OfferBar, StickyBar } from "@/components/site/LandingChrome";
import { LandingLeadForm } from "@/components/site/LandingLeadForm";
import { Photo } from "@/components/site/Photo";
import { Reveal } from "@/components/site/Reveal";
import { images } from "@/config/images";
import { site } from "@/config/site";
import { detailLanding, optionKey } from "@/content/landing";
import { reviews } from "@/content/reviews";
import { serviceBySlug } from "@/content/services";
import {
  trackBookClick,
  trackLandingView,
  trackPhoneClick,
  trackQuoteClick,
} from "@/lib/analytics";
import {
  durationRangeLabel,
  fetchBookingMenu,
  fromPrice,
  type BookableService,
  type BookingMenu,
} from "@/lib/booking";
import { useChannel, type ChannelPhone } from "@/lib/channel";
import { money } from "@/lib/pricing";
import { useShopGallery, useSiteImage } from "@/lib/shopGallery";

/**
 * /detail — the paid landing page for auto detailing.
 *
 * Same contract as /tint, /ppf and /ceramic: no nav, noindex, the logo is the
 * one way off the page, a phone number in the header, a sticky bar on mobile.
 * What's different: detailing is packaged and priced by vehicle size in
 * ShopFlow (Silver / Gold / Platinum), so this page SHOWS the prices and BOOKS
 * the job — package → size → time → $50 deposit — instead of only collecting a
 * quote request. It is the second priced surface after /book (owner call
 * 2026-10-20: detailing can be booked from its ad page), and every number on
 * it is ShopFlow's: prices, what each package includes, how long it takes per
 * size, and the deposit. The "ask first" form at the bottom catches whoever
 * isn't ready to pick a package.
 */

const PATH = "/detail";
const TITLE = "Auto Detailing in Albuquerque | Priced Up Front, Book Online — Evo Solutions";
const DESC =
  "Silver, Gold and Platinum detail packages priced by vehicle size. Pick a time, hold it with a deposit, pay the rest at pickup. Same crew and bay that built the Google reviews.";

const DETAIL = serviceBySlug("auto-detailing");
const SERVICES = ["auto-detailing"] as const;
const SERVICE = detailLanding.leadValue;
const CTA = "Book my detail";

export const Route = createFileRoute("/detail")({
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
  component: DetailingLanding,
});

function DetailingLanding() {
  // The package preset feeds the booking form — from the arrival hash
  // (/detail#gold) or a package card's button; the key bumps so tapping
  // the same card twice still re-applies it.
  const [preset, setPreset] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState(0);
  const pick = (key: string) => {
    setPreset(key);
    setPresetKey((n) => n + 1);
  };

  const [menu, setMenu] = useState<BookingMenu | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    fetchBookingMenu([...SERVICES]).then((m) => alive && setMenu(m));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1).toLowerCase();
    if (hash && hash !== "book" && hash !== "packages" && hash !== "quote-close") setPreset(hash);
  }, []);

  const { phone, offer } = useChannel();
  const [offerDismissed, setOfferDismissed] = useState(false);

  useEffect(() => {
    trackLandingView(SERVICE);
  }, []);

  const deposit = menu?.deposit?.amount ?? null;
  const formProps = { variant: detailLanding, phone };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {offer && !offerDismissed && (
        <OfferBar text={offer} onDismiss={() => setOfferDismissed(true)} />
      )}
      <LandingHeader phone={phone} />
      <main id="main" className="pb-24 lg:pb-0">
        {/* Sales order (owner's call 2026-10-20): proof first, then the value,
            then the price, then the close — a cold click sees the reviews and
            the work before it sees a number, and the booking form sits right
            under the packages so the price and the close are one scroll. */}
        <Hero phone={phone} menu={menu} deposit={deposit} />
        <Proof />
        <TheProblem />
        <Included />
        <Packages menu={menu} onPick={pick} />
        <Book preset={preset} presetKey={presetKey} deposit={deposit} phone={phone} />
        <Objections />
        <Close phone={phone} form={formProps} />
      </main>
      <StickyBar phone={phone} cta={CTA} service={SERVICE} formIds={["quote-close", "book"]} />
    </div>
  );
}

/* ================================================================== hero == */

function Hero({
  phone,
  menu,
  deposit,
}: {
  phone: ChannelPhone;
  menu: BookingMenu | null | undefined;
  deposit: number | null;
}) {
  const heroSrc = useSiteImage("service_detail", images.service.service_detail.webp);
  const isBundled = heroSrc === images.service.service_detail.webp;
  const from = menu?.services.length ? Math.min(...menu.services.map(fromPrice)) : null;

  return (
    <section className="relative isolate overflow-hidden">
      {/* The shop's own detail work, dimmed hard: atmosphere and proof of a
          real bay, never competing with the headline for contrast. */}
      <div className="absolute inset-0 -z-10">
        {isBundled ? (
          <picture>
            <source type="image/avif" srcSet={images.service.service_detail.avif} />
            <img
              src={heroSrc}
              alt=""
              width={images.service.service_detail.width}
              height={images.service.service_detail.height}
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

      <div className="container-x pb-12 pt-10 sm:pt-14 lg:pb-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Albuquerque · Auto Detailing</p>

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
            The detail shop Albuquerque rates {site.reviews.rating.toFixed(1)}.{" "}
            <span className="text-accent">Prices up front, booked online.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Every one of those reviews is for this work — same owner, same crew, same bay on Vista
            Alameda. Below: what customers say, what a detail here actually involves, then three
            packages priced by vehicle size. Pick a time that fits the whole job
            {deposit ? (
              <>
                , hold it with a{" "}
                <strong className="font-semibold text-foreground">{money(deposit)} deposit</strong>{" "}
                that comes off your total,
              </>
            ) : (
              ","
            )}{" "}
            and pay the rest at pickup. Same crew, same bay on Vista Alameda that the Google reviews
            are about.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#packages"
              onClick={() => trackBookClick("landing-hero", SERVICE)}
              className="btn btn-primary btn-lg"
            >
              See packages &amp; book
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
            {from != null && (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Packages from <span className="font-semibold text-foreground">{money(from)}</span>
              </span>
            )}
            <span>Locally owned</span>
            <span>Walk-ins welcome Mon–Sat</span>
            {deposit && <span>Deposit comes off your total</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== packages == */

/**
 * The three packages, straight from ShopFlow: name, price for each vehicle
 * size, how long it takes, and what it includes (the owner's own description,
 * one item per "·" or line). The middle package is featured — it's the one
 * most people land on, and the page should say so before they have to ask.
 */
function Packages({
  menu,
  onPick,
}: {
  menu: BookingMenu | null | undefined;
  onPick: (key: string) => void;
}) {
  const services = menu?.services ?? [];
  const featured = services.length >= 3 ? services[Math.floor(services.length / 2)].id : null;

  return (
    <section id="packages" className="section-y-tight cv-auto scroll-mt-20 border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Packages &amp; prices</p>
          <h2 className="mt-3 max-w-3xl">You've seen the work. Here's what it costs.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Every price is the full price for your vehicle size — no "starting at", no surprise at
            pickup. Not sure which size you are? Pick the closest; we confirm at drop-off before any
            work starts.
          </p>
        </Reveal>

        {menu === undefined ? (
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="min-h-[22rem] animate-pulse rounded-lg border border-border bg-surface/40"
              />
            ))}
          </div>
        ) : !services.length ? (
          <Reveal className="mt-9 rounded-lg border border-border bg-surface/50 p-6">
            <p className="text-muted-foreground">
              Online booking isn't available right now — call{" "}
              <a href={site.business.phoneHref} className="font-semibold text-accent">
                {site.business.phone}
              </a>{" "}
              or ask below and we'll text you the package and price.
            </p>
          </Reveal>
        ) : (
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {services.map((s, i) => (
              <PackageCard
                key={s.id}
                service={s}
                sizes={menu?.sizes ?? []}
                featured={s.id === featured}
                delay={i * 60}
                onPick={() => onPick(optionKey(s.name))}
              />
            ))}
          </div>
        )}

        {menu?.addons.length ? (
          <Reveal className="mt-6 rounded-lg border border-border bg-surface/50 p-5 sm:p-6">
            <p className="eyebrow">Add to any package</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {menu.addons.map((a) => (
                <li key={a.id} className="text-muted-foreground">
                  {a.name}{" "}
                  <span className="font-display font-semibold text-foreground">
                    +{money(a.price)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function PackageCard({
  service: s,
  sizes,
  featured,
  delay,
  onPick,
}: {
  service: BookableService;
  sizes: { key: string; label: string }[];
  featured: boolean;
  delay: number;
  onPick: () => void;
}) {
  const included = s.description
    .split(/\n|·|•|;/)
    .map((x) => x.trim())
    .filter(Boolean);
  const priced = sizes.filter((sz) => s.sizes?.[sz.key] != null);

  return (
    <Reveal
      delay={delay}
      className={`relative flex flex-col rounded-lg border p-6 ${
        featured ? "border-accent/50 bg-accent-soft" : "border-border bg-surface/50"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
          Most popular
        </span>
      )}
      <h3 className="text-xl font-semibold">{s.name}</h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {durationRangeLabel(s)}
      </p>

      {priced.length ? (
        <dl className="mt-5 space-y-1.5 border-y border-border py-4">
          {priced.map((sz) => (
            <div key={sz.key} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted-foreground">{sz.label}</dt>
              <dd className="font-display text-lg font-semibold tabular-nums">
                {money(s.sizes![sz.key])}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 border-y border-border py-4 font-display text-2xl font-bold">
          {money(fromPrice(s))}
        </p>
      )}

      {included.length > 0 && (
        <ul className="mt-5 flex-1 space-y-2.5">
          {included.map((item) => (
            <li key={item} className="flex gap-2.5 text-[0.9375rem] leading-snug">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      )}

      <a
        href="#book"
        onClick={() => {
          onPick();
          trackBookClick("landing-package", s.name);
        }}
        className={`mt-6 ${featured ? "btn btn-primary" : "btn btn-ghost"}`}
      >
        Book {s.name.replace(/ detail$/i, "")}
        <ArrowRight className="h-4 w-4" />
      </a>
    </Reveal>
  );
}

/* ================================================================== book == */

function Book({
  preset,
  presetKey,
  deposit,
  phone,
}: {
  preset: string | null;
  presetKey: number;
  deposit: number | null;
  phone: ChannelPhone;
}) {
  return (
    <section id="book" className="section-y-tight cv-auto scroll-mt-20 border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Book online</p>
          <h2 className="mt-3 max-w-3xl">
            {deposit ? "Pick a time. Hold it with a deposit." : "Pick a time. It's yours."}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Every time shown has room for the whole job on your size of vehicle. Online booking
            starts {site.booking.minNoticeHours} hours out — need it sooner?{" "}
            <a
              href={phone.href}
              onClick={() => trackPhoneClick("landing-book")}
              className="font-semibold text-accent underline underline-offset-4"
            >
              Call {phone.display}
            </a>
            .
          </p>
        </Reveal>
        <div className="mt-9">
          <BookingForm
            preset={preset ?? undefined}
            presetKey={presetKey}
            services={SERVICES}
            quoteNote={
              <>
                Not sure which package, or want tint, coating or PPF done in the same visit?{" "}
                <a
                  href="#quote-close"
                  onClick={() => trackQuoteClick("landing-book", SERVICE)}
                  className="text-accent underline underline-offset-4"
                >
                  Ask first
                </a>{" "}
                and we'll text you back.
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}

/* =============================================================== problem == */

function TheProblem() {
  const costs = DETAIL?.problem.costs ?? [];
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">{DETAIL?.problem.title}</p>
          <h2 className="mt-3 max-w-3xl">
            Detailing here isn't the same job as detailing on the coast.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{DETAIL?.problem.body}</p>
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

/* ============================================================== included == */

function Included() {
  const benefits = (DETAIL?.benefits ?? []).slice(0, 4);
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">How we work</p>
            <h2 className="mt-3">What separates this from a car wash.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A wash cleans the surfaces you can see. A detail gets into the places a vacuum was
              never going to reach, and corrects what's on the paint instead of hiding it.
            </p>
            <ul className="mt-8 space-y-5">
              {benefits.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                  <span>
                    <span className="block font-semibold">{b.title}</span>
                    <span className="mt-1 block text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {b.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel overflow-hidden">
              <Photo
                src={images.service.service_detail.webp}
                avif={images.service.service_detail.avif}
                alt={images.service.service_detail.alt}
                ratio="16/10"
                className="rounded-none"
              />
              <div className="p-6 sm:p-7">
                <h3>Scope is agreed before we start.</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  The package you book is the work that gets done. If something turns out to need
                  more — heavy pet hair, paint that wants correction — we tell you at drop-off and
                  you decide, not after the fact on the invoice.
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

/* ================================================================= proof == */

/**
 * The three real Google reviews plus whatever detail work Angelo has
 * uploaded to ShopFlow, with the bundled photos as the fallback.
 */
function Proof() {
  const { photos } = useShopGallery();
  const [shown, setShown] = useState<{ url: string; alt: string; ratio: string }[]>([]);

  useEffect(() => {
    const work = [
      ...photos.filter((p) => p.tag === "detail"),
      ...photos.filter((p) => p.tag === "ceramic"),
    ].slice(0, 3);
    if (work.length) {
      setShown(work.map((p) => ({ url: p.url, alt: p.alt, ratio: p.letterboxed ? "3/4" : "4/3" })));
    }
  }, [photos]);

  const fallback = [
    {
      url: images.service.service_detail.webp,
      alt: images.service.service_detail.alt,
      ratio: "4/3",
    },
    { url: images.hero.webp, alt: images.hero.alt, ratio: "4/3" },
    {
      url: images.service.service_ceramic.webp,
      alt: images.service.service_ceramic.alt,
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
          <h2 className="mt-3 max-w-3xl">Don't take our word for it.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {site.business.name} traded as {site.business.formerName} until the 2026 rebrand and
            built its rating on detailing — same owner, same crew, same Google profile.
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

        {/* Soft pull toward the price: the proof is the pitch, the packages
            are the ask, and someone sold here shouldn't have to hunt. */}
        <Reveal className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#packages"
            onClick={() => trackBookClick("landing-proof", SERVICE)}
            className="btn btn-primary"
          >
            See what it costs
            <ArrowRight className="h-4 w-4" />
          </a>
          <span className="text-sm text-muted-foreground">
            Three packages, priced by vehicle size — no quote needed.
          </span>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ objections == */

function Objections() {
  const wanted = [
    "How long does a detail take?",
    "Can you get pet hair out?",
    "What's the difference between a detail and a car wash?",
    "Will detailing remove scratches?",
    "Do you work on trucks and SUVs?",
    "Should I detail before selling?",
  ];
  const faqs = wanted
    .map((q) => DETAIL?.faqs.find((f) => f.q === q))
    .filter((f): f is { q: string; a: string } => !!f);

  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Before you book</p>
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

function Close({
  phone,
  form,
}: {
  phone: ChannelPhone;
  form: { variant: typeof detailLanding; phone: ChannelPhone };
}) {
  return (
    <section className="section-y-tight cv-auto border-t border-border">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <h2>Rather ask first?</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Tell us what the car's like and we'll text back which package it actually needs and
              the exact price — usually the same day during shop hours. Rather we see it in person?
              Walk in, Mon–Sat.
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
                <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  Know what you want?{" "}
                  <a
                    href="#book"
                    onClick={() => trackBookClick("landing-close", SERVICE)}
                    className="font-semibold text-accent underline underline-offset-4"
                  >
                    Book it online
                  </a>{" "}
                  — it takes about two minutes.
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <LandingLeadForm id="quote-close" {...form} />
          </Reveal>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.business.name}. {site.business.address}. Prices are for
          the vehicle size you pick and are confirmed at drop-off. Deposits are non-refundable and
          come off your total; need a different time? Call and we'll move it.
        </p>
      </div>
    </section>
  );
}
