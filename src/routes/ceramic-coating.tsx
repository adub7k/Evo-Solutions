import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceHero } from "@/components/site/ServiceHero";
import { Section, SectionHead } from "@/components/site/Section";
import { CostGrid, BenefitGrid, TruthTable, IncludedList } from "@/components/site/ServiceSections";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { QuoteBlock } from "@/components/site/QuoteBlock";
import { ProcessList } from "@/components/site/ProcessList";
import { FaqList } from "@/components/site/FaqList";
import { RelatedServices } from "@/components/site/RelatedServices";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { serviceBySlug } from "@/content/services";
import { site } from "@/config/site";
import { trackPhoneClick, trackQuoteClick } from "@/lib/analytics";
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

/**
 * Brand + warranty, owner-sourced (site.coatingSpecs). The warranty is a paid
 * add-on; like the coating itself it is priced on the quote, never here.
 */
function CoatingGuarantee() {
  const spec = site.coatingSpecs;

  return (
    <Section>
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl rounded-lg border border-accent/35 bg-surface/50 p-7 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
            <ShieldCheck className="h-7 w-7 text-accent" />
          </div>
          <p className="eyebrow mt-6">{spec.brand} ceramic coating</p>
          <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)]">
            Optional {spec.warranty.years}-year paint warranty.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            We install {spec.brand}, a professional-grade coating. If you want the protection in
            writing, add the {spec.warranty.years}-year paint warranty: it covers{" "}
            {spec.warranty.covers} — the hard-water spots and bird droppings that eat into
            unprotected clear coat. It's priced separately from the coating, so you decide whether
            it's worth it for how you use the car.
          </p>
          <a
            href="#quote"
            onClick={() => trackQuoteClick("ceramic-guarantee", s.serviceName)}
            className="btn btn-primary btn-lg mt-8"
          >
            Get My Coating Quote
            <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </Section>
  );
}

/**
 * Coating is quote-only by the owner's decision (2026-09-04): the price
 * depends on paint condition and how far the correction goes, so a chart
 * either overpromises or scares people off. This block replaces the table.
 */
function CallForQuote() {
  return (
    <Section tone="raised">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <SectionHead
            eyebrow="Pricing"
            title="Priced on your car, not off a chart."
            body="A coating on brand-new paint and a coating on three summers of swirls are not the same job, and we won't pretend they cost the same. Tell us the vehicle and send a few photos in daylight, or just call — you'll get one flat number for exactly what your paint needs, not a range."
          />
          <Reveal delay={80}>
            <div className="rounded-lg border border-accent/35 bg-surface/50 p-6 sm:p-8">
              <p className="font-display text-lg font-semibold">Get your coating quote</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Most quotes come back the same day. Walk-ins welcome Mon–Sat if you'd rather we
                see the paint in person.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={site.business.phoneHref}
                  onClick={() => trackPhoneClick("ceramic-pricing")}
                  className="btn btn-primary btn-lg"
                >
                  <Phone className="h-4 w-4" />
                  Call {site.business.phone}
                </a>
                <a
                  href="#quote"
                  onClick={() => trackQuoteClick("ceramic-pricing", s.serviceName)}
                  className="btn btn-ghost btn-lg"
                >
                  Send photos for a quote
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

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

      <CoatingGuarantee />

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

      {/* No price table here — see CallForQuote. */}
      <CallForQuote />

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
