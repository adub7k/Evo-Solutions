import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Scale } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section, SectionHead } from "@/components/site/Section";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { guides } from "@/content/guides";
import { seo, breadcrumbLd } from "@/lib/seo";

const PATH = "/guides";
const TITLE = "Guides — Window Tint, PPF & Coating Advice | Evo Solutions Albuquerque";
const DESC =
  "Straight answers on window tint, paint protection film, ceramic coating and detailing — written by an Albuquerque shop, for Albuquerque conditions.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Guides", path: PATH },
];

const CATEGORIES = ["Window Tint", "Ceramic Coating", "PPF", "Detailing"] as const;

export const Route = createFileRoute("/guides/")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESC, path: PATH });
    return {
      ...meta,
      scripts: [{ type: "application/ld+json", children: breadcrumbLd(CRUMBS) }],
    };
  },
  component: GuidesIndex,
});

function GuidesIndex() {
  const [featured, ...rest] = guides;

  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x pb-10 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />
          <div className="mt-8 max-w-2xl animate-rise">
            <p className="eyebrow">Guides</p>
            <h1 className="mt-4">Straight answers, no sales pitch.</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              The questions we get asked in the shop every week, written out properly — including
              the parts that make us less money to tell you.
            </p>
          </div>
        </div>
      </section>

      {/* The tint law guide is the highest-intent page on the site for search,
          so it gets its own slot above the article list. */}
      <div className="container-x">
        <Link
          to="/tint-laws-new-mexico"
          className="group flex flex-col gap-4 rounded-lg border border-border bg-surface/50 p-6 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div className="flex gap-4">
            <Scale className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
            <div>
              <h2 className="font-display text-xl font-semibold">New Mexico window tint laws</h2>
              <p className="mt-1 text-muted-foreground">
                What's legal on each window, the windshield rule, reflectivity and medical
                exemptions.
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <Section tight>
        <div className="container-x">
          {featured && (
            <Reveal className="border-b border-border pb-9">
              <Link to="/guides/$slug" params={{ slug: featured.slug }} className="group block">
                <p className="eyebrow">Latest · {featured.category}</p>
                <h2 className="mt-3 max-w-3xl text-[clamp(1.6rem,3.4vw,2.4rem)]">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">
                  {featured.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  Read it · {featured.minutes} min
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          )}

          <div className="mt-12 space-y-14">
            {CATEGORIES.map((cat) => {
              const items = rest.filter((g) => g.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                    {cat}
                  </h2>
                  <ul className="mt-5 border-t border-border">
                    {items.map((g, i) => (
                      <Reveal
                        as="li"
                        key={g.slug}
                        delay={i * 40}
                        className="border-b border-border"
                      >
                        <Link
                          to="/guides/$slug"
                          params={{ slug: g.slug }}
                          className="group grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8"
                        >
                          <div>
                            <h3 className="font-display text-lg font-semibold sm:text-xl">
                              {g.title}
                            </h3>
                            <p className="mt-1.5 leading-relaxed text-muted-foreground">
                              {g.description}
                            </p>
                          </div>
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-sm text-accent">
                            {g.minutes} min
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <FinalCTA
        heading="Read enough? Let's get you a price."
        body="Tell us the vehicle and what you're after — you'll get a flat number, not a range."
        location="guides-final"
      />
    </SiteLayout>
  );
}
