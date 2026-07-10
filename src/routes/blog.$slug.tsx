import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { site } from "@/config/site";
import { postBySlug, posts } from "@/content/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = postBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Guide — Evo Solutions" }] };
    return {
      meta: [
        { title: `${post.title} | Evo Solutions Albuquerque` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `https://www.evosolution.org/blog/${post.slug}` }],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { post } = Route.useLoaderData();
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <SiteLayout>
      <article className="pt-32 pb-16 sm:pt-40">
        <div className="container-x max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            All guides
          </Link>
          <div className="mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.minutes} min read
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl text-balance leading-[1.1]">{post.title}</h1>

          <div className="mt-10 space-y-8">
            {post.sections.map((s, i) => (
              <section key={i}>
                {s.h && <h2 className="text-2xl sm:text-3xl mb-4">{s.h}</h2>}
                <div className="space-y-4">
                  {s.ps.map((p, k) => (
                    <p key={k} className="text-muted-foreground leading-relaxed">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-3xl hairline bg-card p-8 text-center shadow-elevated">
            <h2 className="text-2xl sm:text-3xl">Ready to talk specifics for your vehicle?</h2>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="/#quote"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110 transition-all"
              >
                Get a Free Quote
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={site.business.phoneHref}
                className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3 text-sm font-medium hover:bg-surface-elevated transition-colors"
              >
                Call {site.business.phone}
              </a>
            </div>
          </div>

          {others.length > 0 && (
            <div className="mt-14">
              <div className="text-xs uppercase tracking-[0.24em] text-accent mb-5">Keep reading</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {others.map((p) => (
                  <Link
                    key={p.slug}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="group rounded-2xl hairline bg-card/60 p-6 transition-colors hover:bg-card"
                  >
                    <div className="text-lg leading-snug group-hover:text-accent transition-colors">{p.title}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{p.minutes} min read</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </SiteLayout>
  );
}
