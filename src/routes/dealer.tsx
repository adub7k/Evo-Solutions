import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  Droplets,
  Phone,
  ShieldCheck,
  Sparkles,
  SunDim,
  Wand2,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Photo } from "@/components/site/Photo";
import { TrustLine } from "@/components/site/TrustBar";
import { Section, SectionHead } from "@/components/site/Section";
import { IncludedList } from "@/components/site/ServiceSections";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { ProcessList } from "@/components/site/ProcessList";
import { FaqList } from "@/components/site/FaqList";
import { BrandLine } from "@/components/site/BrandLine";
import { DealerForm } from "@/components/site/DealerForm";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { images } from "@/config/images";
import { useSiteImage } from "@/lib/shopGallery";
import { trackPhoneClick } from "@/lib/analytics";
import { seo, faqLd, serviceLd, breadcrumbLd } from "@/lib/seo";

const PATH = "/dealer";
const TITLE = "Dealer Detailing in Albuquerque — Correction, Tint, Coating & PPF | Evo Solutions";
const DESCRIPTION = `Dealership detailing in Albuquerque, plus paint correction, window tint, ceramic coating and PPF. Working with ${listBrands(site.dealerClients)} dealerships.`;
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "For Dealers", path: PATH },
];

/**
 * What Evo offers a dealership. Every line here describes work the shop
 * already does and claims already published elsewhere on the site (film
 * brands, tint warranty, Nasiol + its optional warranty). Nothing about
 * discounts, pickup, invoicing or turnaround — those come from
 * `site.dealerTerms` and render only once Angelo has confirmed them.
 */
/** The headline service — detailing is most of what Evo does for dealers. */
const detailing = {
  icon: Sparkles,
  title: "Detailing & recon",
  to: "/auto-detailing",
  body: "Most of what we do for dealers. New cars detailed for delivery, trade-ins and auction buys brought back to front-line ready — the work this shop was built on, and where the Google reviews came from.",
  points: [
    "New-car delivery details",
    "Used-car recon on trade-ins and auction buys",
    "Interior deep clean, steam and extraction",
    "Clay and iron decontamination",
    "Odor, pet hair and engine bays",
    "Sealant to finish",
  ],
};

const offers = [
  {
    icon: Wand2,
    title: "Paint correction",
    to: "/auto-detailing",
    body: "Machine polishing that takes out swirls, wash marring and lot scratches instead of hiding them under glaze — so the car looks right under showroom lights.",
    points: [
      "One-step polish for front-line units",
      "Swirl and wash-mar removal",
      "Prep before coating or PPF",
    ],
  },
  {
    icon: SunDim,
    title: "Window tint",
    to: "/window-tint",
    body: "Carbon and ceramic film on front-line and sold units, with the shade checked against New Mexico law before it goes on.",
    points: [
      "Carbon and ceramic film",
      site.tintSpecs.warranty,
      "Front two to match factory privacy glass",
    ],
  },
  {
    icon: Droplets,
    title: "Ceramic coating",
    to: "/ceramic-coating",
    body: `${site.coatingSpecs.brand} ceramic coating, applied after a proper decontamination so it bonds to clean paint — not to the lot dust.`,
    points: [
      `${site.coatingSpecs.brand} coating, installed in-house`,
      `Optional ${site.coatingSpecs.warranty.label} covering ${site.coatingSpecs.warranty.covers}`,
      "Paint prepped and decontaminated first",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Paint protection film",
    to: "/paint-protection-film",
    body: "Clear, self-healing film over the panels that chip first. Easy to offer at delivery, and the paint underneath stays factory for trade-in.",
    points: ["Partial front or full front", "Extended and full-body coverage", "Removable later"],
  },
];

const process = [
  {
    title: "One call to set it up",
    body: "Tell us what you sell, which services you want, and roughly how many cars. We set up the account and the rates for it.",
  },
  {
    title: "Send the car over",
    body: `Vehicle work is done at the shop on ${site.business.addressParts.street.split(",")[0]}. Tell us the stock number and what it needs.`,
  },
  {
    title: "We do the work and check it",
    body: "Detailing, correction, tint, coating and film are all done in-house by the same crew — nothing is farmed out.",
  },
  {
    title: "You get it back ready to sell",
    body: "We let you know when it's done. Anything we spotted on the car that you should know about, we tell you.",
  },
];

const faqs = [
  {
    q: "Which dealerships do you work with now?",
    a: `We currently do work for ${listBrands(site.dealerClients)} dealerships — mostly detailing, with correction, tint, coating and PPF on top.`,
  },
  {
    q: "Do you have dealer pricing?",
    a: "Yes — rates are set per account, based on which services you use and how many cars a month. Send the form or call and Angelo will go through it with you.",
  },
  {
    q: "Can you do a detail, correction, tint and coating on the same car?",
    a: "Yes. It's all done in-house at the one shop, so a car can come in for a detail and leave corrected, coated and tinted — no shuttling it between vendors.",
  },
  {
    q: "Is the tint legal in New Mexico?",
    a: "New Mexico allows 20% VLT on the front sides, rear sides and rear window, and only non-reflective film above the AS-1 line on the windshield. We confirm the current rule for each vehicle before we install.",
  },
  {
    q: "What film and coating do you use?",
    a: `Window and paint protection film from ${site.filmBrands.join(" and ")}, and ${site.coatingSpecs.brand} ceramic coating. The tint film carries a lifetime warranty; the coating has an optional ${site.coatingSpecs.warranty.label} covering ${site.coatingSpecs.warranty.covers}.`,
  },
  {
    q: "Do you only work with big stores?",
    a: "No. A small independent lot sending a few cars a month is just as welcome as a franchise store. Tell us your volume and we'll set it up to suit.",
  },
];

/** "A, B and C" */
function listBrands(brands: string[]) {
  return brands.length < 2
    ? (brands[0] ?? "")
    : `${brands.slice(0, -1).join(", ")} and ${brands[brands.length - 1]}`;
}

/** Owner-confirmed program terms only; empty until VERIFY.md items come back. */
const terms = Object.values(site.dealerTerms).filter((t): t is string => !!t);

export const Route = createFileRoute("/dealer")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESCRIPTION, path: PATH });
    return {
      ...meta,
      scripts: [
        {
          type: "application/ld+json",
          children: serviceLd("Dealer detailing", DESCRIPTION, PATH),
        },
        { type: "application/ld+json", children: faqLd(faqs) },
        { type: "application/ld+json", children: breadcrumbLd(CRUMBS) },
      ],
    };
  },
  component: DealerPage,
});

function DealerPage() {
  const fallback = images.service.service_detail;
  const heroSrc = useSiteImage("service_detail", fallback.webp);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-[4.5rem]">
        <div className="container-x pb-12 pt-8 sm:pb-16 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div className="animate-rise">
              <p className="eyebrow">Dealer Program · Albuquerque</p>
              <h1 className="mt-4">Dealer detailing, done to a showroom standard.</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We detail cars for {listBrands(site.dealerClients)} dealerships. Detailing is the
                core of it — paint correction, window tint, ceramic coating and PPF are done
                in-house by the same crew when a car needs more. Send the car, tell us what it
                needs, and get it back ready for the front line.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#dealer-account" className="btn btn-primary btn-lg">
                  Set up a dealer account
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={site.business.phoneHref}
                  onClick={() => trackPhoneClick("dealer-hero")}
                  className="btn btn-ghost btn-lg"
                >
                  <Phone className="h-4 w-4" />
                  {site.business.phone}
                </a>
              </div>

              <TrustLine className="mt-7" />
            </div>

            <Photo
              src={heroSrc}
              alt={fallback.alt}
              ratio="4/3"
              priority
              className="lg:aspect-[5/4]"
            />
          </div>
        </div>
      </section>

      {/* What we offer — the whole point of the page, so it comes first. */}
      <Section tone="raised">
        <div className="container-x">
          <SectionHead
            eyebrow="What we offer dealers"
            title="Detailing first. Everything else under the same roof."
            body="Most dealer cars just need a proper detail. When one needs more, it doesn't leave the shop."
          />

          <Reveal className="panel mt-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div>
              <detailing.icon className="h-7 w-7 text-accent" />
              <h3 className="mt-4 font-display text-3xl font-semibold">{detailing.title}</h3>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted-foreground">
                {detailing.body}
              </p>
              <Link
                to={detailing.to}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
              >
                More on detailing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="grid content-center gap-3 text-[0.9375rem]">
              {detailing.points.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {offers.map((o, i) => (
              <Reveal key={o.title} delay={i * 50} className="panel flex flex-col p-6 sm:p-8">
                <o.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-2xl font-semibold">{o.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{o.body}</p>
                <ul className="mt-5 space-y-2 text-[0.9375rem]">
                  {o.points.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={o.to}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                >
                  More on {o.title.toLowerCase()}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Reveal>
            ))}
          </div>
          <BrandLine className="mt-8" />
        </div>
      </Section>

      {/* Brand names as plain text, never logos — see site.dealerClients. */}
      <Section>
        <div className="container-x">
          <SectionHead
            eyebrow="Who we work for"
            title="Dealerships we work for now."
            body="Big franchise store or small used lot — the same crew and the same standard."
          />
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {site.dealerClients.map((b, i) => (
              <Reveal
                as="li"
                key={b}
                delay={i * 40}
                className="panel grid place-items-center px-3 py-6 text-center"
              >
                <span className="whitespace-nowrap font-display text-lg font-semibold xl:text-xl">
                  {b}
                </span>
                <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  dealerships
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="raised">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Why dealers use Evo" title="Fewer vendors, fewer surprises." />
            <IncludedList
              items={[
                "Detailing first — the work the shop was built on",
                "Correction, tint, coating and PPF all in-house too",
                `${site.reviews.rating.toFixed(1)} stars across ${site.reviews.count} Google reviews`,
                "Tint shade checked against New Mexico law",
                `${site.filmBrands.join(" and ")} film`,
                "Lifetime warranty on the tint film",
                "Open Monday to Saturday",
                ...terms,
              ]}
            />
          </div>
          <div>
            <SectionHead eyebrow="How it works" title="From first call to front line." />
            <ProcessList steps={process} />
          </div>
        </div>
      </Section>

      <Section className="cv-auto">
        <div className="container-x">
          <SectionHead eyebrow="Our work" title="Cars that have been through the shop." />
          <GalleryGrid showFilters={false} limit={6} />
        </div>
      </Section>

      <section id="dealer-account" className="scroll-mt-24 border-y border-border bg-surface/40">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">Dealer accounts</p>
              <h2 className="mt-3">Set up an account.</h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
                Tell us about the store and what you need. Angelo will call to go through the
                services, the rates for your volume, and how you'd like to send cars over.
              </p>
              <div className="mt-6 flex items-center gap-3 text-muted-foreground">
                <ClipboardList className="h-5 w-5 shrink-0 text-accent" />
                <span>Takes about a minute. No commitment.</span>
              </div>
              <a
                href={site.business.phoneHref}
                onClick={() => trackPhoneClick("dealer-form")}
                className="mt-6 inline-flex items-center gap-2 font-medium text-accent"
              >
                <Phone className="h-4 w-4" />
                Or call {site.business.phone}
              </a>
            </Reveal>
            <Reveal delay={80}>
              <DealerForm />
            </Reveal>
          </div>
        </div>
      </section>

      <Section className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead eyebrow="Dealer FAQ" title="What dealers ask." />
          <FaqList faqs={faqs} />
        </div>
      </Section>
    </SiteLayout>
  );
}
