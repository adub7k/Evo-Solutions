import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceHero } from "@/components/site/ServiceHero";
import { Section, SectionHead } from "@/components/site/Section";
import { CostGrid, BenefitGrid, IncludedList } from "@/components/site/ServiceSections";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { Progression } from "@/components/site/Progression";
import { QuoteBlock } from "@/components/site/QuoteBlock";
import { PricingTable } from "@/components/site/PricingTable";
import { ProcessList } from "@/components/site/ProcessList";
import { Reviews, ReviewsCta } from "@/components/site/Reviews";
import { FaqList } from "@/components/site/FaqList";
import { RelatedServices } from "@/components/site/RelatedServices";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { serviceBySlug } from "@/content/services";
import { seo, faqLd, serviceLd, breadcrumbLd } from "@/lib/seo";

const s = serviceBySlug("auto-detailing")!;
const PATH = "/auto-detailing";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Auto Detailing", path: PATH },
];

/** Who books a detail, and what they're actually solving. */
const whoFor = [
  {
    title: "Selling or trading it in",
    body: "The highest-return day of work you can put into a car you're about to list. A corrected, properly cleaned car changes what people offer before they've driven it.",
  },
  {
    title: "Handing back a lease",
    body: "Wear charges are assessed on what the inspector sees. An interior detail and a polish is usually cheaper than the deductions.",
  },
  {
    title: "The family car",
    body: "Kid seats, spilled drinks, dog hair, snacks under the seat rails. Extraction and steam get into the places a vacuum was never going to reach.",
  },
  {
    title: "The work truck",
    body: "Job-site dust in the seat fabric acts like sandpaper every time you get in. Worth doing a few times a year on anything that earns its keep.",
  },
  {
    title: "Before a coating",
    body: "Correction is the same work either way. Doing both in one visit means you only pay for the prep once.",
  },
  {
    title: "Because it's yours",
    body: "Some people just want their car to feel like it did when they bought it. That's reason enough.",
  },
];

export const Route = createFileRoute("/auto-detailing")({
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
  component: Detailing,
});

function Detailing() {
  return (
    <SiteLayout>
      <ServiceHero
        eyebrow={s.eyebrow}
        headline={s.headline}
        sub={s.sub}
        slot="service_detail"
        serviceName={s.serviceName}
        breadcrumbs={CRUMBS}
      />

      {/*
        Detailing is where the shop's reviews come from, so the social proof
        sits high on this page instead of near the bottom like the others.
      */}
      <Section tone="raised" tight>
        <div className="container-x">
          <SectionHead
            eyebrow={`${site.reviews.rating.toFixed(1)} on Google · ${site.reviews.count} reviews`}
            title="This is the work the reviews are about."
            body={`The shop traded as ${site.business.formerName} before the rebrand and built its rating on detailing. Same owner, same crew, same address.`}
            align="center"
          />
          <Reviews />
          <div className="mt-8 text-center">
            <ReviewsCta />
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="The problem" title={s.problem.title} body={s.problem.body} />
          <CostGrid costs={s.problem.costs} />
        </div>
      </Section>

      {/* The full included list gets its own section here — on a detailing
          page, the list of what's actually done IS the product. */}
      <Section tone="raised">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <SectionHead
              eyebrow="What's included"
              title="What a detail here actually covers."
              body="Scope is agreed before we start — interior only, exterior only, or the whole car. Paint correction is quoted separately once we've seen the paint."
            />
            <Reveal
              delay={60}
              className="rounded-lg border border-border bg-background/60 p-6 sm:p-8"
            >
              <IncludedList items={s.included} />
            </Reveal>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="How we work" title="What separates this from a car wash." />
          <BenefitGrid benefits={s.benefits} />
        </div>
      </Section>

      <Section tone="raised" className="cv-auto" tight>
        <div className="container-x">
          <SectionHead eyebrow="In the bay" title="Start of the job, end of the job." />
          <Progression />
        </div>
      </Section>

      <Section className="cv-auto">
        <div className="container-x">
          <SectionHead eyebrow="Detail work" title="Cars we've had through recently." />
          <GalleryGrid tag="detail" showFilters={false} limit={6} />
        </div>
      </Section>

      <Section tone="raised">
        <div className="container-x">
          <SectionHead eyebrow="Who books one" title="Reasons people bring a car in." />
          <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {whoFor.map((w, i) => (
              <Reveal key={w.title} delay={i * 40}>
                <div className="h-px w-10 bg-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{w.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Published pricing, read live from ShopFlow so it can never drift
          from what Angelo actually charges. */}
      <Section tone="raised">
        <div className="container-x">
          <SectionHead
            eyebrow="Pricing"
            title="What a detail costs."
            body="Priced by vehicle size, same as at the counter. Condition is the only thing that moves it."
          />
          <div className="mt-10">
            <PricingTable
              slug={s.slug}
              serviceName={s.serviceName}
              note="Heavy soiling, embedded pet hair and paint correction are quoted on top once we’ve seen the car — photos with your quote request get you a far more accurate number."
            />
          </div>
        </div>
      </Section>

      <QuoteBlock
        heading={s.quote.heading}
        sub={s.quote.sub}
        serviceSlug={s.slug}
        points={[
          "Photos of the interior get you a far more accurate number",
          "Scope agreed before we start",
          "Walk-ins welcome Mon–Sat",
        ]}
      />

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="The process" title="How a detail runs." />
          <ProcessList steps={s.process} />
        </div>
      </Section>

      <Section tone="raised" className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead eyebrow="Detailing FAQ" title="What people ask." />
          <FaqList faqs={s.faqs} />
        </div>
      </Section>

      <RelatedServices slugs={s.related} guidesFor={s.slug} />
      <FinalCTA
        heading="Bring it in and let's see what it needs."
        body="Send photos of the worst of it — we've seen worse, and you'll get a straight number back."
        location="detailing-final"
        service={s.serviceName}
      />
    </SiteLayout>
  );
}
