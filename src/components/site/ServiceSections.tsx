import { Check, X } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Section blocks shared across the service pages. Each page composes these in
 * its own order — the pages are not one template with the noun swapped.
 */

/** "What this costs you if you do nothing" — loss aversion, honestly framed. */
export function CostGrid({ costs }: { costs: { label: string; body: string }[] }) {
  return (
    <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {costs.map((c, i) => (
        <Reveal key={c.label} delay={i * 50}>
          <h3 className="font-display text-lg font-semibold">{c.label}</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">{c.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function BenefitGrid({ benefits }: { benefits: { title: string; body: string }[] }) {
  return (
    <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {benefits.map((b, i) => (
        <Reveal key={b.title} delay={i * 40}>
          <div className="h-px w-10 bg-accent" />
          <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">{b.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * The does / doesn't table. This is the single strongest trust device on a
 * service page: nobody expects the shop to tell them what the product won't
 * do, and saying it plainly is what separates Evo from the shop that promises
 * everything.
 */
export function TruthTable({
  truths,
  doesLabel = "What it does",
  doesNotLabel = "What it doesn't do",
}: {
  truths: { does: string[]; doesNot: string[] };
  doesLabel?: string;
  doesNotLabel?: string;
}) {
  return (
    <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      <div className="bg-surface/60 p-6 sm:p-7">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          {doesLabel}
        </h3>
        <ul className="mt-5 space-y-3">
          {truths.does.map((d) => (
            <li key={d} className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
              <span className="leading-relaxed">{d}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-background/60 p-6 sm:p-7">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {doesNotLabel}
        </h3>
        <ul className="mt-5 space-y-3">
          {truths.doesNot.map((d) => (
            <li key={d} className="flex gap-3">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-faint-foreground" strokeWidth={2.5} />
              <span className="leading-relaxed text-muted-foreground">{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Film tiers / coverage levels. No prices — the site is quote-only. */
export function OptionsList({
  items,
}: {
  items: { name: string; tag: string; body: string; bestFor: string }[];
}) {
  return (
    <div className="mt-10 border-t border-border">
      {items.map((o, i) => (
        <Reveal
          key={o.name}
          delay={i * 50}
          className="grid gap-x-10 gap-y-3 border-b border-border py-7 md:grid-cols-[14rem_1fr]"
        >
          <div>
            <h3 className="font-display text-xl font-semibold">{o.name}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              {o.tag}
            </p>
          </div>
          <div>
            <p className="leading-relaxed text-muted-foreground">{o.body}</p>
            <p className="mt-2.5 text-sm">
              <span className="text-faint-foreground">Best for: </span>
              <span className="text-foreground/90">{o.bestFor}</span>
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function IncludedList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it} className="flex gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
          <span className="leading-relaxed text-muted-foreground">{it}</span>
        </li>
      ))}
    </ul>
  );
}
