import { createFileRoute } from "@tanstack/react-router";
import { Building2, Home, Store, Warehouse, Stethoscope, UtensilsCrossed } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceHero } from "@/components/site/ServiceHero";
import { Section, SectionHead } from "@/components/site/Section";
import { CostGrid, BenefitGrid, IncludedList } from "@/components/site/ServiceSections";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { ProcessList } from "@/components/site/ProcessList";
import { FaqList } from "@/components/site/FaqList";
import { CommercialQuoteForm } from "@/components/site/CommercialQuoteForm";
import { RelatedServices } from "@/components/site/RelatedServices";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { serviceBySlug } from "@/content/services";
import { seo, faqLd, serviceLd, breadcrumbLd } from "@/lib/seo";

const s = serviceBySlug("commercial-window-tint")!;
const PATH = "/commercial-window-tint";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Commercial & Home Tint", path: PATH },
];

const spaces = [
  { icon: Building2, label: "Offices", note: "West-facing desks nobody wants in summer." },
  { icon: Store, label: "Retail & storefronts", note: "Stock that fades and windows that cook." },
  {
    icon: UtensilsCrossed,
    label: "Restaurants & bars",
    note: "Glare on screens, heat on the patio side.",
  },
  { icon: Warehouse, label: "Warehouse & industrial", note: "Big glass, big cooling load." },
  { icon: Stethoscope, label: "Medical & dental", note: "Daytime privacy at street level." },
  { icon: Home, label: "Homes", note: "Sunrooms, picture windows, west-facing living rooms." },
];

export const Route = createFileRoute("/commercial-window-tint")({
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
  component: CommercialTint,
});

function CommercialTint() {
  return (
    <SiteLayout>
      <ServiceHero
        eyebrow={s.eyebrow}
        headline={s.headline}
        sub={s.sub}
        slot="service_commercial"
        serviceName={s.serviceName}
        breadcrumbs={CRUMBS}
      />

      {/* Who this is for, first — a commercial visitor needs to recognise
          their own building before they'll read anything else. */}
      <Section tone="raised">
        <div className="container-x">
          <SectionHead
            eyebrow="Who we do this for"
            title="If it has glass, we can film it."
            body={`We install on site across ${site.serviceArea.primary} and the surrounding metro — ${site.serviceArea.nearby.join(", ")}.`}
          />
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((sp, i) => (
              <Reveal key={sp.label} delay={i * 40} className="flex gap-4">
                <sp.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-display text-lg font-semibold">{sp.label}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{sp.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-x">
          <SectionHead eyebrow="The problem" title={s.problem.title} body={s.problem.body} />
          <CostGrid costs={s.problem.costs} />
        </div>
      </Section>

      <Section tone="raised">
        <div className="container-x">
          <SectionHead eyebrow="What film does" title="What changes after it goes on." />
          <BenefitGrid benefits={s.benefits} />
        </div>
      </Section>

      <Section className="cv-auto">
        <div className="container-x">
          <SectionHead
            eyebrow="Buildings we've filmed"
            title="Storefronts, restaurants and homes around Albuquerque."
          />
          <GalleryGrid tag="commercial" showFilters={false} limit={6} />
        </div>
      </Section>

      <Section tone="raised">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Included" title="What every job covers." />
            <IncludedList items={s.included} />
          </div>
          <div>
            <SectionHead eyebrow="The process" title="From first call to walkthrough." />
            <ProcessList steps={s.process} />
          </div>
        </div>
      </Section>

      {/* Commercial gets its own single-screen lead form — a building owner
          can't answer "year, make and model". */}
      <section id="quote" className="border-y border-border bg-surface/40 scroll-mt-24">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">Free on-site assessment</p>
              <h2 className="mt-3">{s.quote.heading}</h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
                {s.lead?.blurb}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                We'll come out, measure, work out which elevations are actually causing the problem,
                and put a fixed number in writing before anything is ordered.
              </p>
            </Reveal>
            <Reveal delay={80}>{s.lead && <CommercialQuoteForm lead={s.lead} />}</Reveal>
          </div>
        </div>
      </section>

      <Section className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead eyebrow="Commercial FAQ" title="What building owners ask." />
          <FaqList faqs={s.faqs} />
        </div>
      </Section>

      <RelatedServices slugs={s.related} />
      <FinalCTA
        heading="Want to know if your building is a good candidate?"
        body="Tell us the space and what's driving it. We'll come and look, and we'll tell you honestly if film isn't the answer."
        location="commercial-final"
        service={s.serviceName}
      />
    </SiteLayout>
  );
}
