import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Car,
  ClipboardList,
  Phone,
  ShieldCheck,
  Sparkles,
  SunDim,
  Truck,
  Droplets,
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
const TITLE = "Dealer Program — Tint, PPF, Coating & Recon in Albuquerque | Evo Solutions";
const DESCRIPTION =
  "Window tint, paint protection film, ceramic coating and detailing for Albuquerque dealerships. One shop, all in-house, one call to set up an account.";
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
const offers = [
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
    icon: ShieldCheck,
    title: "Paint protection film",
    to: "/paint-protection-film",
    body: "Clear, self-healing film over the panels that chip first. Easy to offer at delivery, and the paint underneath stays factory for trade-in.",
    points: ["Partial front or full front", "Extended and full-body coverage", "Removable later"],
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
    icon: Sparkles,
    title: "Detailing & recon",
    to: "/auto-detailing",
    body: "Trade-ins and auction cars brought back to front-line ready. This is the work the shop was built on — it's where the Google reviews came from.",
    points: [
      "Interior deep clean, steam and extraction",
      "Clay, iron decon and paint correction",
      "Odor, pet hair and engine bays",
    ],
  },
];

const stores = [
  {
    icon: Building2,
    label: "Franchise & new-car stores",
    note: "Tint, PPF and coating as delivery add-ons, done before the customer picks up.",
  },
  {
    icon: Car,
    label: "Independent & used lots",
    note: "Recon on trade-ins and auction buys so they photograph well and sell sooner.",
  },
  {
    icon: Truck,
    label: "Fleet & commercial vehicles",
    note: "Tint and interior cleans for work trucks and vans, done in batches.",
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
    body: "Tint, film, coating and detailing are all done in-house by the same crew — nothing is farmed out.",
  },
  {
    title: "You get it back ready to sell",
    body: "We let you know when it's done. Anything we spotted on the car that you should know about, we tell you.",
  },
];

const faqs = [
  {
    q: "Do you have dealer pricing?",
    a: "Yes — rates are set per account, based on which services you use and how many cars a month. Send the form or call and Angelo will go through it with you.",
  },
  {
    q: "Can you do tint, PPF, coating and a detail on the same car?",
    a: "Yes. It's all done in-house at the one shop, so a car can come in for a detail and leave with film and coating too — no shuttling it between vendors.",
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
          children: serviceLd("Dealer vehicle services", DESCRIPTION, PATH),
        },
        { type: "application/ld+json", children: faqLd(faqs) },
        { type: "application/ld+json", children: breadcrumbLd(CRUMBS) },
      ],
    };
  },
  component: DealerPage,
});

function DealerPage() {
  const fallback = images.service.service_ppf;
  const heroSrc = useSiteImage("service_ppf", fallback.webp);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-[4.5rem]">
        <div className="container-x pb-12 pt-8 sm:pb-16 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div className="animate-rise">
              <p className="eyebrow">Dealer Program · Albuquerque</p>
              <h1 className="mt-4">Tint, film, coating and recon. One shop, one call.</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Evo Solutions does window tint, paint protection film, ceramic coating and detailing
                for Albuquerque dealerships — all in-house, by the same crew. Send the car, tell us
                what it needs, and get it back ready for the front line.
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
            title="Everything a car needs between the auction and the front line."
            body="Four services, one shop. Use one or all of them."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
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

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="Who we work with" title="Big store or small lot." />
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {stores.map((st, i) => (
              <Reveal key={st.label} delay={i * 40} className="flex gap-4">
                <st.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-display text-lg font-semibold">{st.label}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{st.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="raised">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Why dealers use Evo" title="Fewer vendors, fewer surprises." />
            <IncludedList
              items={[
                "Tint, PPF, coating and detailing all in-house",
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
