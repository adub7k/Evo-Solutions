import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Section, SectionHead } from "@/components/site/Section";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { Progression } from "@/components/site/Progression";
import { ProcessList } from "@/components/site/ProcessList";
import { Reviews, ReviewsCta } from "@/components/site/Reviews";
import { FaqList } from "@/components/site/FaqList";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { images } from "@/config/images";
import { whyEvo, homeFaqs } from "@/content/home";
import { progression } from "@/content/gallery";
import { seo, faqLd } from "@/lib/seo";

const TITLE = "Window Tint, PPF & Detailing in Albuquerque, NM | Evo Solutions";
const DESC =
  "Ceramic window tint, paint protection film, ceramic coating and auto detailing in Albuquerque, New Mexico. Rated 5.0 on Google. Free quote, no pressure.";

/** How the shop actually works, start to finish. */
const process = [
  {
    title: "Request a quote",
    body: "Tell us the vehicle and what's bothering you. Takes about a minute, and photos help if you have them.",
  },
  {
    title: "Get a recommendation",
    body: "We come back with what we'd actually put on your car and why — including when the cheaper option is the right one.",
  },
  {
    title: "Book a time",
    body: "We agree a day that works and set the time aside. Walk-ins are welcome, but booking means the bay is ready for you.",
  },
  {
    title: "Drop it off",
    body: "Bring it to the shop on Vista Alameda. Your car stays inside for the whole job.",
  },
  {
    title: "Pick it up",
    body: "We walk you around it, show you what we did, and tell you how to look after it.",
  },
];

export const Route = createFileRoute("/")({
  head: () => {
    const s = seo({ title: TITLE, description: DESC, path: "/" });
    return {
      ...s,
      links: [
        ...s.links,
        // The hero is the LCP element — start fetching it with the HTML rather
        // than waiting for the CSS/layout pass. Typed as AVIF so browsers that
        // can't decode it skip the preload instead of double-fetching.
        {
          rel: "preload",
          as: "image",
          type: "image/avif",
          href: images.hero.avif,
          imageSrcSet: images.hero.avifSrcSet,
          imageSizes: images.hero.sizes,
          fetchPriority: "high",
        },
      ],
      scripts: [{ type: "application/ld+json", children: faqLd(homeFaqs) }],
    };
  },
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <TrustBar />

      {/* ---------------------------------------------------------- services */}
      <Section id="services">
        <div className="container-x">
          <SectionHead
            eyebrow="What we do"
            title="Four services, one shop, one crew."
            body="Everything is done in-house at the Vista Alameda bay — which means if you're doing more than one, we can sequence it properly instead of sending you across town."
          />
          <ServiceGrid />
        </div>
      </Section>

      {/* --------------------------------------------------------- why evo */}
      <Section tone="raised">
        <div className="container-x">
          <SectionHead
            eyebrow="Why Evo"
            title="Why people pick this shop over the one down the road."
            body="No claims here we can't back up. If something matters to you that isn't on this list, ask us — we'll give you a straight answer."
          />
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {whyEvo.map((w, i) => (
              <Reveal key={w.title} delay={i * 40}>
                <div className="h-px w-10 bg-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{w.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------- real work */}
      <Section id="work" className="cv-auto">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="Real work"
              title="Cars that have actually been through the bay."
              body="Every photo on this site was taken at the shop. No stock photography, no other shop's portfolio."
              className="max-w-xl"
            />
            <Link to="/gallery" className="btn btn-ghost shrink-0">
              See more of our work
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <GalleryGrid limit={9} showFilters={false} />
        </div>
      </Section>

      {/* ------------------------------------------------------ progression */}
      <Section tone="raised" className="cv-auto" tight>
        <div className="container-x">
          <SectionHead
            eyebrow={progression.eyebrow}
            title={progression.title}
            body={progression.body}
          />
          <Progression />
        </div>
      </Section>

      {/* ----------------------------------------------------------- process */}
      <Section className="cv-auto">
        <div className="container-x">
          <SectionHead
            eyebrow="How it works"
            title="From first message to picking it up."
            body="No mystery pricing and no surprises at the counter. Here's the whole thing."
          />
          <ProcessList steps={process} />
        </div>
      </Section>

      {/* ---------------------------------------------------------- reviews */}
      <Section id="reviews" tone="raised" className="cv-auto">
        <div className="container-x">
          <SectionHead
            eyebrow={`${site.reviews.rating.toFixed(1)} on Google · ${site.reviews.count} reviews`}
            title="What customers say."
            body={`Reviews from the shop's Google profile — which goes back to when Evo traded as ${site.business.formerName}.`}
          />
          <Reviews />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ReviewsCta />
            <Link to="/reviews" className="text-sm text-muted-foreground hover:text-foreground">
              More reviews →
            </Link>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------------- faq */}
      <Section className="cv-auto">
        <div className="container-x grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <SectionHead
            eyebrow="Questions"
            title="The things people ask before they book."
            body="Can't see yours? Call the shop — we'd rather answer it than have you guess."
          />
          <div>
            <FaqList faqs={homeFaqs} />
            <p className="mt-6 text-sm text-muted-foreground">
              More detail in our{" "}
              <Link to="/guides" className="text-accent underline underline-offset-4">
                guides
              </Link>{" "}
              and the{" "}
              <Link to="/tint-laws-new-mexico" className="text-accent underline underline-offset-4">
                New Mexico tint law guide
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <FinalCTA />
    </SiteLayout>
  );
}
