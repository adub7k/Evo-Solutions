import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { guides, guideBySlug, type Block } from "@/content/guides";
import { serviceBySlug } from "@/content/services";
import { seo, articleLd, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = guideBySlug(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const path = `/guides/${loaderData.slug}`;
    const meta = seo({
      title: `${loaderData.title} | Evo Solutions Albuquerque`,
      description: loaderData.description,
      path,
      type: "article",
      publishedTime: loaderData.date,
    });
    return {
      ...meta,
      scripts: [
        {
          type: "application/ld+json",
          children: articleLd({
            title: loaderData.title,
            description: loaderData.description,
            path,
            published: loaderData.date,
          }),
        },
        {
          type: "application/ld+json",
          children: breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: loaderData.navTitle, path },
          ]),
        },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const guide = Route.useLoaderData();
  const service = serviceBySlug(guide.service);
  const more = guides
    .filter((g) => g.slug !== guide.slug && g.category === guide.category)
    .slice(0, 3);

  const published = new Date(guide.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SiteLayout>
      <article className="pt-[4.5rem]">
        <header className="container-prose pb-8 pt-8 sm:pt-12">
          <Breadcrumbs
            trail={[
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides" },
              { name: guide.navTitle, path: `/guides/${guide.slug}` },
            ]}
          />
          <p className="eyebrow mt-8">{guide.category}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.6vw,3.1rem)]">{guide.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{guide.description}</p>
          <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            <time dateTime={guide.date}>{published}</time> · {guide.minutes} min read · Written by
            the crew at Evo Solutions, Albuquerque
          </p>
        </header>

        <div className="container-prose pb-14">
          {guide.body.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}

          {/* Every guide ends by pointing at the service that solves it. */}
          {service && (
            <Reveal className="mt-12 rounded-lg border border-border bg-surface/50 p-6 sm:p-7">
              <p className="eyebrow">Next step</p>
              <h2 className="mt-2.5 font-display text-2xl">
                {service.serviceName} at Evo Solutions
              </h2>
              <p className="mt-2.5 leading-relaxed text-muted-foreground">{service.cardBlurb}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={service.route} className="btn btn-primary">
                  See {service.serviceName.toLowerCase()}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/quote" className="btn btn-ghost">
                  Get a quote
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-border bg-surface/40">
          <div className="container-x section-y-tight">
            <h2 className="font-display text-xl font-semibold">
              More on {guide.category.toLowerCase()}
            </h2>
            <ul className="mt-6 border-t border-border">
              {more.map((g) => (
                <li key={g.slug} className="border-b border-border">
                  <Link
                    to="/guides/$slug"
                    params={{ slug: g.slug }}
                    className="group flex items-center justify-between gap-6 py-4"
                  >
                    <span className="font-display font-semibold">{g.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/guides"
              className="mt-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All guides
            </Link>
          </div>
        </section>
      )}

      <FinalCTA location="guide-final" />
    </SiteLayout>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "h2":
      return <h2 className="mt-11 text-[clamp(1.4rem,2.6vw,1.9rem)]">{block.x}</h2>;
    case "h3":
      return <h3 className="mt-8 font-display text-xl font-semibold">{block.x}</h3>;
    case "p":
      return (
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-muted-foreground">{block.x}</p>
      );
    case "ul":
      return (
        <ul className="mt-5 space-y-2.5">
          {block.items.map((it) => (
            <li
              key={it}
              className="flex gap-3 text-[1.0625rem] leading-[1.7] text-muted-foreground"
            >
              <span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-5 space-y-2.5">
          {block.items.map((it, i) => (
            <li
              key={it}
              className="flex gap-3 text-[1.0625rem] leading-[1.7] text-muted-foreground"
            >
              <span className="font-display font-bold tabular-nums text-accent">{i + 1}.</span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <aside className="mt-7 border-l-2 border-accent bg-surface/50 py-4 pl-5 pr-4">
          <p className="text-[1.0625rem] leading-[1.7]">{block.x}</p>
        </aside>
      );
    case "cta":
      return (
        <p className="mt-7 text-[1.0625rem] leading-[1.7]">
          {block.x}{" "}
          <Link to={block.to} className="font-medium text-accent underline underline-offset-4">
            {block.label} →
          </Link>
        </p>
      );
  }
}
