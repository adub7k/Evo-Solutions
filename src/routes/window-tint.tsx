import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceHero } from "@/components/site/ServiceHero";
import { Section, SectionHead } from "@/components/site/Section";
import {
  CostGrid,
  BenefitGrid,
  OptionsList,
  TruthTable,
  IncludedList,
} from "@/components/site/ServiceSections";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { QuoteBlock } from "@/components/site/QuoteBlock";
import { PricingTable } from "@/components/site/PricingTable";
import { BrandLine } from "@/components/site/BrandLine";
import { ProcessList } from "@/components/site/ProcessList";
import { Reviews } from "@/components/site/Reviews";
import { FaqList } from "@/components/site/FaqList";
import { RelatedServices } from "@/components/site/RelatedServices";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { serviceBySlug } from "@/content/services";
import { seo, faqLd, serviceLd, breadcrumbLd } from "@/lib/seo";

const s = serviceBySlug("window-tint")!;
const PATH = "/window-tint";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Window Tint", path: PATH },
];

/** Shade reference. These are just VLT labels, not performance claims. */
const shades = [
  {
    vlt: "70%",
    name: "Clear / IR",
    note: "Looks like factory glass. Windshield-friendly.",
    opacity: 0.22,
  },
  {
    vlt: "50%",
    name: "Light",
    note: "Cuts glare without changing the car's character.",
    opacity: 0.42,
  },
  {
    vlt: "35%",
    name: "Classic",
    note: "Clearly tinted, still easy to see out of at night.",
    opacity: 0.62,
  },
  {
    vlt: "20%",
    name: "Legal limit",
    note: "New Mexico's darkest legal shade. Real privacy.",
    opacity: 0.8,
  },
];

export const Route = createFileRoute("/window-tint")({
  head: () => {
    const meta = seo({ title: s.metaTitle, description: s.metaDescription, path: PATH });
    return {
      ...meta,
      scripts: [
        {
          type: "application/ld+json",
          children: serviceLd(s.serviceName, s.metaDescription, PATH),
        },
        { type: "application/ld+json", children: faqLd(s.faqs) },
        { type: "application/ld+json", children: breadcrumbLd(CRUMBS) },
      ],
    };
  },
  component: WindowTint,
});

function WindowTint() {
  return (
    <SiteLayout>
      <ServiceHero
        eyebrow={s.eyebrow}
        headline={s.headline}
        sub={s.sub}
        slot="service_tint"
        serviceName={s.serviceName}
        breadcrumbs={CRUMBS}
      />

      {/* The problem, before the pitch. */}
      <Section tone="raised">
        <div className="container-x">
          <SectionHead eyebrow="The problem" title={s.problem.title} body={s.problem.body} />
          <CostGrid costs={s.problem.costs} />
        </div>
      </Section>

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="What you get" title="What tint actually changes, day to day." />
          <BenefitGrid benefits={s.benefits} />
        </div>
      </Section>

      {/* Film tiers */}
      {s.options && (
        <Section tone="raised">
          <div className="container-x">
            <SectionHead eyebrow="Film options" title={s.options.title} body={s.options.intro} />
            <OptionsList items={s.options.items} />
          </div>
        </Section>
      )}

      {/* Shade picker — specific to this page. */}
      <Section>
        <div className="container-x">
          <SectionHead
            eyebrow="Choosing a shade"
            title="How dark is dark, actually?"
            body="Lower number means darker glass. New Mexico allows 20% on the front sides, rear sides and rear window — darker than most states permit."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shades.map((sh, i) => (
              <Reveal
                key={sh.vlt}
                delay={i * 50}
                className="rounded-lg border border-border overflow-hidden"
              >
                {/* Simulated glass: a scrim over a light ground, darkening
                    with the shade. Illustrative, not a colour match. */}
                <div className="relative h-28 bg-gradient-to-br from-zinc-300 to-zinc-500">
                  <div className="absolute inset-0 bg-black" style={{ opacity: sh.opacity }} />
                  <span className="absolute bottom-2.5 left-3 font-display text-2xl font-bold text-white drop-shadow">
                    {sh.vlt}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold">{sh.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{sh.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-4 text-sm text-faint-foreground">
            Swatches are illustrative — film looks different on your glass, and different again at
            night. We'll hold real samples against your car before you decide.
          </p>

          <Reveal className="mt-8 flex flex-col gap-3 rounded-lg border border-border bg-surface/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Scale className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Legal limits vary by window, and the measurement is the film <em>and</em> your glass
                together. We'll confirm what's legal for your vehicle before we install.
              </p>
            </div>
            <Link to="/tint-laws-new-mexico" className="btn btn-ghost shrink-0">
              New Mexico tint laws
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Honest expectations */}
      {s.truths && (
        <Section tone="raised">
          <div className="container-x">
            <SectionHead
              eyebrow="Straight answers"
              title="What tint will and won't do."
              body="Worth knowing before you spend the money — including the bits most shops leave out."
            />
            <TruthTable truths={s.truths} />
          </div>
        </Section>
      )}

      {/* Proof */}
      <Section className="cv-auto">
        <div className="container-x">
          <SectionHead eyebrow="Tint we've installed" title="Real cars, shot in our bay." />
          <GalleryGrid tag="tint" showFilters={false} limit={6} />
        </div>
      </Section>

      {/* Published pricing, read live from ShopFlow so it can never drift
          from what Angelo actually charges. */}
      <Section>
        <div className="container-x">
          <SectionHead
            eyebrow="Pricing"
            title="What tint costs here."
            body="Real prices for a standard vehicle, straight from our booking system — the same numbers we quote at the counter."
          />
          <div className="mt-10">
            <PricingTable
              slug={s.slug}
              serviceName={s.serviceName}
              note="Removing failed old film is quoted separately — it's real labour, especially on rear glass with defroster lines. Oversized or unusually shaped glass can move the number too."
            />
          </div>
          <BrandLine className="mt-6" />
        </div>
      </Section>

      <QuoteBlock heading={s.quote.heading} sub={s.quote.sub} serviceSlug={s.slug} />

      <Section>
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Included" title="What's in every tint job." />
            <IncludedList items={s.included} />
          </div>
          <div>
            <SectionHead eyebrow="The process" title="How it goes." />
            <ProcessList steps={s.process} />
          </div>
        </div>
      </Section>

      <Section tone="raised" className="cv-auto">
        <div className="container-x">
          <SectionHead eyebrow="Reviews" title="What customers say." align="center" />
          <Reviews />
        </div>
      </Section>

      <Section className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead eyebrow="Tint FAQ" title="Questions we get every week." />
          <FaqList faqs={s.faqs} />
        </div>
      </Section>

      <RelatedServices slugs={s.related} guidesFor={s.slug} />
      <FinalCTA
        heading="Ready to stop baking?"
        body="Send us the year, make and model and we'll come back with a shade recommendation and a flat price."
        location="window-tint-final"
        service={s.serviceName}
      />
    </SiteLayout>
  );
}
