import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { serviceBySlug } from "@/content/services";
import { guidesForService } from "@/content/guides";

/**
 * Internal linking block. Every service page points at its siblings and at the
 * guides that feed it, so nothing on the site ends up orphaned and link equity
 * moves between the pages that should rank together.
 */
export function RelatedServices({ slugs, guidesFor }: { slugs: string[]; guidesFor?: string }) {
  const related = slugs.map(serviceBySlug).filter(Boolean);
  const relatedGuides = guidesFor ? guidesForService(guidesFor) : [];

  return (
    <section className="container-x section-y-tight">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="font-display text-xl font-semibold">Often done alongside</h2>
          <ul className="mt-5 border-t border-border">
            {related.map((s) => (
              <li key={s!.slug} className="border-b border-border">
                <Link to={s!.route} className="group flex items-center justify-between gap-4 py-4">
                  <span>
                    <span className="font-display font-semibold">{s!.serviceName}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {s!.cardBlurb}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {relatedGuides.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold">Worth reading first</h2>
            <ul className="mt-5 border-t border-border">
              {relatedGuides.map((g) => (
                <li key={g.slug} className="border-b border-border">
                  <Link
                    to="/guides/$slug"
                    params={{ slug: g.slug }}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span>
                      <span className="font-display font-semibold">{g.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {g.minutes} min read
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
