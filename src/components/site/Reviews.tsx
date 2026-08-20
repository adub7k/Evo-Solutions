import { Star, ExternalLink } from "lucide-react";
import { site } from "@/config/site";
import { reviews } from "@/content/reviews";
import { Reveal } from "./Reveal";

/**
 * Real Google reviews only — see src/content/reviews.ts. The rating and count
 * shown here are the same numbers emitted in aggregateRating markup, so they
 * can never disagree with what Google sees.
 */
export function Reviews({ limit }: { limit?: number }) {
  const shown = limit ? reviews.slice(0, limit) : reviews;

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {shown.map((r, i) => (
        <Reveal
          key={r.id}
          delay={i * 60}
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
  );
}

export function ReviewsCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={site.reviews.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-4 ${className}`}
    >
      Read all {site.reviews.count} reviews on Google
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
