import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceHero } from "@/components/site/ServiceHero";
import { Section, SectionHead } from "@/components/site/Section";
import { CostGrid, BenefitGrid, TruthTable, IncludedList } from "@/components/site/ServiceSections";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { QuoteBlock } from "@/components/site/QuoteBlock";
import { PricingTable } from "@/components/site/PricingTable";
import { ProcessList } from "@/components/site/ProcessList";
import { FaqList } from "@/components/site/FaqList";
import { RelatedServices } from "@/components/site/RelatedServices";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { serviceBySlug } from "@/content/services";
import { seo, faqLd, serviceLd, breadcrumbLd } from "@/lib/seo";

const s = serviceBySlug("ceramic-coating")!;
const PATH = "/ceramic-coating";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Ceramic Coating", path: PATH },
];

export const Route = createFileRoute("/ceramic-coating")({
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
  component: CeramicCoating,
});

function CeramicCoating() {
  return (
    <SiteLayout>
      <ServiceHero
        eyebrow={s.eyebrow}
        headline={s.headline}
        sub={s.sub}
        slot="service_ceramic"
        serviceName={s.serviceName}
        breadcrumbs={CRUMBS}
      />

      {/*
        This page leads with the honest limits rather than the benefits.
        Ceramic coating is the most oversold product in the industry, and the
        buyer arriving here has usually been promised something impossible by
        someone else. Correcting that first is what earns the rest of the page.
      */}
      {s.truths && (
        <Section tone="raised">
          <div className="container-x">
            <SectionHead
              eyebrow="Before anything else"
              title="What a coating is, and what it isn't."
              body="Plenty of shops will let you believe a coating makes a car bulletproof. It doesn't, and you should know exactly what you're buying."
            />
            <TruthTable
              truths={s.truths}
              doesLabel="What a coating does"
              doesNotLabel="What it will not do"
            />
          </div>
        </Section>
      )}

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="The problem" title={s.problem.title} body={s.problem.body} />
          <CostGrid costs={s.problem.costs} />
        </div>
      </Section>

      <Section tone="raised">
        <div className="container-x">
          <SectionHead eyebrow="What changes" title="What you'll actually notice." />
          <BenefitGrid benefits={s.benefits} />
        </div>
      </Section>

      {/* The prep argument — the thing that separates a real coating job. */}
      <Section>
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="eyebrow">The part that matters</p>
              <h2 className="mt-3">Prep is the product.</h2>
              <div className="mt-5 space-y-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
                <p>
                  A ceramic coating is optically clear and it bonds to whatever is underneath it.
                  Applied over swirl marks and oxidation, it doesn't hide them — it seals them in
                  and makes them glossy.
                </p>
                <p>
                  That's why the polish comes before the bottle, and why two coating quotes for the
                  same car can be so far apart. One of them includes correcting the paint. The other
                  is a coating poured onto whatever state the car turned up in.
                </p>
                <p className="text-foreground">
                  If a quote doesn't mention correction, it isn't quoting the same job.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-lg border border-border bg-surface/50 p-6 sm:p-8">
                <h3 className="font-display text-lg font-semibold">What's included</h3>
                <IncludedList items={s.included} />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="raised" className="cv-auto">
        <div className="container-x">
          <SectionHead eyebrow="Coating & correction work" title="Paint we've brought back." />
          <GalleryGrid tag="detail" showFilters={false} limit={6} />
        </div>
      </Section>

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="The process" title="What happens while we have the car." />
          <ProcessList steps={s.process} />
        </div>
      </Section>

      {/* Published pricing, read live from ShopFlow so it can never drift
          from what Angelo actually charges. */}
      <Section tone="raised">
        <div className="container-x">
          <SectionHead
            eyebrow="Pricing"
            title="What a coating costs."
            body="The coating itself is a known number. What varies is the correction underneath it — which is most of the work."
          />
          <div className="mt-10">
            <PricingTable
              slug={s.slug}
              serviceName={s.serviceName}
              note="This covers the coating on paint that’s ready for it. Paint correction is quoted separately once we’ve seen the car, because that’s the part that genuinely varies."
            />
          </div>
        </div>
      </Section>

      <QuoteBlock
        heading={s.quote.heading}
        sub={s.quote.sub}
        serviceSlug={s.slug}
        points={[
          "We'll tell you what correction the paint needs first",
          "A flat price once we've seen it, not a range",
          "No obligation and no pressure",
        ]}
      />

      <Section className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead eyebrow="Coating FAQ" title="The questions worth asking." />
          <FaqList faqs={s.faqs} />
        </div>
      </Section>

      <RelatedServices slugs={s.related} guidesFor={s.slug} />
      <FinalCTA
        heading="Want to know what your paint actually needs?"
        body="Send a few photos in daylight and we'll tell you honestly whether a coating is worth it on your car — and what it would take to do it properly."
        location="ceramic-final"
        service={s.serviceName}
      />
    </SiteLayout>
  );
}
