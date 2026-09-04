import { Link } from "@tanstack/react-router";
import { ArrowRight, Info } from "lucide-react";
import { usePricing, money, lowestOf } from "@/lib/pricing";
import { Reveal } from "./Reveal";
import { trackQuoteClick } from "@/lib/analytics";

/**
 * Published pricing for one service, read live from ShopFlow.
 *
 * Renders nothing at all when the API is unreachable or the service has no
 * priced entries — the page keeps its quote CTA either way, and a page with no
 * price is far better than a page with a stale one.
 */
export function PricingTable({
  slug,
  serviceName,
  note,
}: {
  slug: string;
  serviceName: string;
  /** Service-specific caveat, e.g. what changes the number. */
  note?: string;
}) {
  const pricing = usePricing();
  const rows = pricing?.rows[slug];
  if (!rows?.length) return null;

  const addons = pricing?.addons[slug] ?? [];
  // Column headers are every size ANY row prices, in the tenant's order —
  // a row priced for sedans only (e.g. "new paint") must not shrink the table
  // to one column and hide the other rows' SUV/truck prices.
  const sizeCols = (pricing?.sizes ?? []).filter((sz) =>
    rows.some((r) => r.sizes?.some((s) => s.key === sz.key)),
  );

  return (
    <Reveal>
      {/*
        Phones get stacked cards, not a sideways-scrolling table. At 320–430px a
        four-column price grid means dragging the most commercially important
        content off-screen to read it, which is a bad trade for the sake of one
        layout. The table returns at sm and up, where it fits and scans better.
      */}
      <div className="space-y-3 sm:hidden">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface/40 p-4">
            <h3 className="font-display font-semibold">{r.name}</h3>
            {r.sizes ? (
              <dl className="mt-3 space-y-1.5">
                {r.sizes.map((sz) => (
                  <div key={sz.key} className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-muted-foreground">{sz.label}</dt>
                    <dd className="font-display text-lg font-semibold tabular-nums">
                      {money(sz.amount)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <span className="text-sm text-muted-foreground">All vehicles</span>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {money(r.flat ?? lowestOf(r))}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">{serviceName} pricing by vehicle size</caption>
          <thead>
            <tr className="bg-surface">
              <th
                scope="col"
                className="px-5 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Service
              </th>
              {sizeCols.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="px-5 py-3.5 text-right font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="px-5 py-4 align-middle font-medium">
                  {r.name}
                </th>
                {r.sizes ? (
                  sizeCols.map((c) => {
                    const s = r.sizes?.find((x) => x.key === c.key);
                    return (
                      <td
                        key={c.key}
                        className="px-5 py-4 text-right font-display text-lg font-semibold tabular-nums"
                      >
                        {s ? (
                          money(s.amount)
                        ) : (
                          <span className="text-sm font-normal text-muted-foreground">ask</span>
                        )}
                      </td>
                    );
                  })
                ) : (
                  <td
                    colSpan={Math.max(sizeCols.length, 1)}
                    className="px-5 py-4 text-right font-display text-lg font-semibold tabular-nums"
                  >
                    {money(r.flat ?? lowestOf(r))}
                    <span className="ml-2 align-middle text-xs font-normal text-muted-foreground">
                      all vehicles
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addons.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Add-ons
          </h3>
          <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {addons.map((a) => (
              <li
                key={a.id}
                className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
              >
                <span className="text-muted-foreground">{a.name}</span>
                <span className="font-display font-semibold tabular-nums">+{money(a.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-surface/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {note ??
              "Prices are for a standard vehicle. Anything unusual — oversized glass, existing film to remove, or paint that needs work first — we'll tell you before we start, not after."}
            {pricing?.deposit && (
              <>
                {" "}
                A {money(pricing.deposit.amount)} deposit secures your appointment and comes off the
                total.
              </>
            )}
          </p>
        </div>
        <Link
          to="/quote"
          onClick={() => trackQuoteClick("pricing-table", serviceName)}
          className="btn btn-ghost shrink-0"
        >
          Confirm my price
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Reveal>
  );
}

/** "from $425" for the homepage service cards. Renders nothing without data. */
export function StartingAt({ amount }: { amount: number | null }) {
  if (amount == null) return null;
  return (
    <span className="whitespace-nowrap text-sm text-muted-foreground">
      from <span className="font-display font-semibold text-foreground">{money(amount)}</span>
    </span>
  );
}
