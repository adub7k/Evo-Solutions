import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { posts } from "@/content/posts";

const TITLE = "Tint & Detailing Guides — Evo Solutions Albuquerque";
const DESC =
  "Straight answers on window tint, ceramic coatings, and PPF from an Albuquerque shop — shade guides, care instructions, and honest comparisons.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "https://www.evosolution.org/blog" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 sm:pt-40">
        <div className="container-x max-w-3xl">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Guides</div>
          <h1 className="mt-4 text-4xl sm:text-6xl text-balance leading-[1.05]">
            Straight answers, no sales pitch.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
            The questions we answer at the counter every week — written down so you can
            decide before you ever call us.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x max-w-3xl space-y-5">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 50}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block rounded-3xl hairline bg-card/60 p-7 sm:p-8 transition-colors hover:bg-card"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.minutes} min read
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl group-hover:text-accent transition-colors">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
                  Read guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
