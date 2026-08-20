import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

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
import { FaqList } from "@/components/site/FaqList";
import { RelatedServices } from "@/components/site/RelatedServices";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { serviceBySlug } from "@/content/services";
import { seo, faqLd, serviceLd, breadcrumbLd } from "@/lib/seo";

const s = serviceBySlug("paint-protection-film")!;
const PATH = "/paint-protection-film";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Paint Protection Film", path: PATH },
];

/** Where damage lands, in order of how often we see it. */
const impactZones = [
  { zone: "Front bumper", note: "Takes the most, by a wide margin." },
  { zone: "Leading edge of the hood", note: "Catches almost everything that clears the bumper." },
  { zone: "Mirrors", note: "Small, exposed, and expensive to repaint." },
  { zone: "Headlights", note: "Sandblasting hazes the lens — a safety issue, not just cosmetic." },
  { zone: "A-pillars & roof edge", note: "Highway miles at speed." },
  { zone: "Rockers & behind the wheels", note: "Everything the front tyres throw backwards." },
];

export const Route = createFileRoute("/paint-protection-film")({
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
  component: Ppf,
});

function Ppf() {
  return (
    <SiteLayout>
      <ServiceHero
        eyebrow={s.eyebrow}
        headline={s.headline}
        sub={s.sub}
        slot="service_ppf"
        serviceName={s.serviceName}
        breadcrumbs={CRUMBS}
      />

      <Section tone="raised">
        <div className="container-x">
          <SectionHead eyebrow="The problem" title={s.problem.title} body={s.problem.body} />
          <CostGrid costs={s.problem.costs} />
        </div>
      </Section>

      {/* Impact map — specific to this page. Damage isn't random. */}
      <Section>
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <SectionHead
              eyebrow="Where it lands"
              title="Chips aren't random."
              body="Look at any five-year-old car in this city and the damage is in the same handful of places. That's what decides how much film you actually need."
            />
            <Reveal delay={60}>
              <ol className="border-t border-border">
                {impactZones.map((z, i) => (
                  <li
                    key={z.zone}
                    className="grid grid-cols-[2rem_1fr] gap-4 border-b border-border py-4"
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
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Coverage is the real decision on this page, so it comes early. */}
      {s.options && (
        <Section tone="raised">
          <div className="container-x">
            <SectionHead eyebrow="Coverage" title={s.options.title} body={s.options.intro} />
            <OptionsList items={s.options.items} />
          </div>
        </Section>
      )}

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="Why film" title="What you're actually buying." />
          <BenefitGrid benefits={s.benefits} />
        </div>
      </Section>

      {s.truths && (
        <Section tone="raised">
          <div className="container-x">
            <SectionHead eyebrow="Straight answers" title="What film will and won't stop." />
            <TruthTable truths={s.truths} />

            <Reveal className="mt-8 flex flex-col gap-4 rounded-lg border border-border bg-background/60 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="leading-relaxed text-muted-foreground">
                Still deciding between film and a ceramic coating? They solve completely different
                problems — and plenty of people need both.
              </p>
              <Link
                to="/guides/$slug"
                params={{ slug: "ppf-vs-ceramic-coating" }}
                className="btn btn-ghost shrink-0"
              >
                PPF vs ceramic coating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </Section>
      )}

      <Section className="cv-auto">
        <div className="container-x">
          <SectionHead eyebrow="Film we've installed" title="Real installs, in our bay." />
          <GalleryGrid tag="ppf" showFilters={false} limit={6} />
        </div>
      </Section>

      {/* Published pricing, read live from ShopFlow so it can never drift
          from what Angelo actually charges. */}
      <Section>
        <div className="container-x">
          <SectionHead
            eyebrow="Pricing"
            title="What film costs."
            body="Our standard coverage by vehicle size. Extended and full-body coverage is quoted per car, because no two are the same shape."
          />
          <div className="mt-10">
            <PricingTable
              slug={s.slug}
              serviceName={s.serviceName}
              note="This is standard coverage for that vehicle size. Track, extended and full-body packages are quoted individually, and existing chips are worth addressing before film goes on."
            />
          </div>
          <BrandLine className="mt-6" />
        </div>
      </Section>

      <QuoteBlock
        heading={s.quote.heading}
        sub={s.quote.sub}
        serviceSlug={s.slug}
        points={[
          "We'll recommend coverage, not the biggest invoice",
          "Existing chips pointed out before we start",
          "A flat price and honest timescales",
        ]}
      />

      <Section>
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Included" title="What's in every film job." />
            <IncludedList items={s.included} />
          </div>
          <div>
            <SectionHead eyebrow="The process" title="How an install runs." />
            <ProcessList steps={s.process} />
          </div>
        </div>
      </Section>

      <Section tone="raised" className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead eyebrow="PPF FAQ" title="What people ask about film." />
          <FaqList faqs={s.faqs} />
        </div>
      </Section>

      <RelatedServices slugs={s.related} guidesFor={s.slug} />
      <FinalCTA
        heading="Stop the next chip before it happens."
        body="Send us a photo of your front end and how you drive it. We'll tell you what coverage actually solves it."
        location="ppf-final"
        service={s.serviceName}
      />
    </SiteLayout>
  );
}
