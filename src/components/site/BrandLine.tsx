import { site } from "@/config/site";

/**
 * The films Evo actually installs. Confirmed by Angelo — the previous site
 * listed six brands the shop doesn't carry, so this stays a plain statement of
 * what's on the shelf, not an "authorised dealer" claim we can't back up.
 */
export function BrandLine({ className = "" }: { className?: string }) {
  if (!site.filmBrands.length) return null;
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      The films we install are{" "}
      {site.filmBrands.map((b, i) => (
        <span key={b}>
          {i > 0 && i === site.filmBrands.length - 1 ? " and " : i > 0 ? ", " : ""}
          <span className="font-display font-semibold text-foreground">{b}</span>
        </span>
      ))}
      .
    </p>
  );
}
