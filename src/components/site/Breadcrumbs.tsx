import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

/** Visible breadcrumbs; the matching BreadcrumbList JSON-LD lives in seo.ts. */
export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {trail.map((t, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={t.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-foreground">
                  {t.name}
                </span>
              ) : (
                <>
                  <Link to={t.path} className="hover:text-foreground transition-colors">
                    {t.name}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-faint-foreground" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
