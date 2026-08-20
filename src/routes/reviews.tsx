import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, ExternalLink } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section, SectionHead } from "@/components/site/Section";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { reviews, rebrandNote } from "@/content/reviews";
import { services } from "@/content/services";
import { seo, breadcrumbLd } from "@/lib/seo";

const PATH = "/reviews";
const TITLE = "Reviews — Evo Solutions, Albuquerque | 5.0 on Google";
const DESC =
  "What customers say about Evo Solutions in Albuquerque. Real reviews from the shop's Google Business Profile, going back to when it traded as MAD Detailing NM.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Reviews", path: PATH },
];

export const Route = createFileRoute("/reviews")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESC, path: PATH });
    return {
      ...meta,
      scripts: [{ type: "application/ld+json", children: breadcrumbLd(CRUMBS) }],
    };
  },
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x pb-12 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />

          <div className="mt-8 max-w-2xl animate-rise">
            <p className="eyebrow">Reviews</p>
            <h1 className="mt-4">
              {site.reviews.rating.toFixed(1)} on Google, across {site.reviews.count} reviews.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Every review below is on the shop's public Google profile. We don't write our own, we
              don't buy them, and we don't put anything on this page that isn't there.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface/60 px-4 py-2.5">
                <span className="flex" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </span>
                <span className="font-display font-bold">{site.reviews.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  · {site.reviews.count} reviews
                </span>
              </div>
              <a
                href={site.reviews.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                See them on Google
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section tight>
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal
                key={r.id}
                delay={i * 50}
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
                  <cite className="not-italic font-medium">{r.name}</cite>
                  <span className="block text-xs text-muted-foreground">via {r.source}</span>
                </footer>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 rounded-lg border border-border bg-background/60 p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold">
              Why some reviews mention detailing
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{rebrandNote}</p>
            <Link
              to="/about"
              className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
            >
              More about the rebrand
            </Link>
          </Reveal>
        </div>
      </Section>

      <Section tone="raised" tight>
        <div className="container-x">
          <SectionHead
            eyebrow="Had work done here?"
            title="A review genuinely helps a small shop."
            body="If we did right by you, thirty seconds on Google makes a real difference to whether the next person finds us."
          />
          <a
            href={site.reviews.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-7"
          >
            Leave a review
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </Section>

      <Section className="cv-auto" tight>
        <div className="container-x">
          <h2 className="font-display text-xl font-semibold">What we do</h2>
          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} className="border-b border-border">
                <Link to={s.route} className="block py-4 font-display font-semibold">
                  {s.serviceName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCTA location="reviews-final" />
    </SiteLayout>
  );
}
