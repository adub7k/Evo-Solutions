import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, CalendarCheck, Loader2, MapPin, Phone } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { site } from "@/config/site";
import { seo } from "@/lib/seo";
import {
  depositCheckout,
  formatBookingDate,
  loadSummary,
  type BookingSummary,
} from "@/lib/booking";
import { money } from "@/lib/pricing";
import { trackBookingConfirmed, trackPhoneClick } from "@/lib/analytics";

/**
 * Where Square sends the customer back after the deposit checkout:
 *   /book/confirmed?booking=<appointment id>&status=confirmed|unpaid
 * `status` is set by ShopFlow after it asks Square whether the order was
 * actually paid — this page only displays it. The booking details come from
 * sessionStorage (saved before leaving for Square); without them the page
 * still shows the right outcome, just without the itemised summary.
 */
export const Route = createFileRoute("/book/confirmed")({
  validateSearch: (s: Record<string, unknown>): { booking?: string; status?: string } => ({
    booking: typeof s.booking === "string" ? s.booking : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  head: () =>
    seo({
      title: "Booking | Evo Solutions",
      description: "Your Evo Solutions booking.",
      path: "/book/confirmed",
      noindex: true,
    }),
  component: Confirmed,
});

const FIRED_KEY = "evo_booking_tracked";

function Confirmed() {
  const { booking, status } = Route.useSearch();
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const paid = status === "confirmed";

  useEffect(() => {
    const s = loadSummary(booking ?? null);
    setSummary(s);
    // One conversion per booking, however many times the page is reloaded.
    if (paid && booking) {
      try {
        if (sessionStorage.getItem(FIRED_KEY) === booking) return;
        sessionStorage.setItem(FIRED_KEY, booking);
      } catch {
        /* fire anyway */
      }
      trackBookingConfirmed(s?.service ?? "Window Tint", s?.total ?? 0, s?.deposit ?? 0);
    }
  }, [booking, paid]);

  async function retry() {
    if (!booking) return;
    setRetrying(true);
    const url = await depositCheckout(booking);
    if (url) window.location.href = url;
    else {
      setRetrying(false);
      setRetryFailed(true);
    }
  }

  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x max-w-2xl pb-20 pt-12 sm:pt-16">
          {paid ? (
            <div className="animate-rise">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
                <CalendarCheck className="h-7 w-7" />
              </span>
              <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)]">You're booked.</h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {summary
                  ? `We'll see you ${formatBookingDate(summary.date)} at ${summary.time}.`
                  : "Your deposit went through and your appointment is confirmed."}{" "}
                The shop has your details and will text if anything changes.
              </p>
            </div>
          ) : (
            <div className="animate-rise">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </span>
              <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)]">Your spot isn't held yet.</h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                The deposit didn't go through, so the time is still open to others. Finish the
                payment to lock it in, or call and we'll sort it out.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {booking && (
                  <button
                    type="button"
                    onClick={retry}
                    disabled={retrying}
                    className="btn btn-primary btn-lg"
                  >
                    {retrying ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Finish paying the deposit"
                    )}
                  </button>
                )}
                <a
                  href={site.business.phoneHref}
                  onClick={() => trackPhoneClick("book-unpaid")}
                  className="btn btn-ghost btn-lg"
                >
                  <Phone className="h-4 w-4" />
                  {site.business.phone}
                </a>
              </div>
              {retryFailed && (
                <p className="mt-3 text-sm text-destructive">
                  The payment page wouldn't open. Please call the shop.
                </p>
              )}
            </div>
          )}

          {summary && (
            <dl className="panel mt-10 space-y-3 p-5 text-sm sm:p-6">
              <Row label="Service" value={summary.service} />
              {summary.addons.map((a) => (
                <Row key={a} label="Extra" value={a} />
              ))}
              <Row label="Vehicle" value={summary.vehicle} />
              <Row label="When" value={`${formatBookingDate(summary.date)}, ${summary.time}`} />
              <div className="border-t border-border pt-3">
                <Row label="Total" value={money(summary.total)} />
                {paid && summary.deposit > 0 && (
                  <>
                    <Row label="Deposit paid" value={money(summary.deposit)} />
                    <Row
                      label="Due at pickup"
                      value={money(Math.max(summary.total - summary.deposit, 0))}
                    />
                  </>
                )}
              </div>
            </dl>
          )}

          <div className="mt-8 rounded-lg border border-border bg-surface/50 p-5 text-sm sm:p-6">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {site.business.address}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.business.mapsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-accent underline underline-offset-4"
                >
                  Directions
                </a>
              </span>
            </p>
            <p className="mt-3 text-muted-foreground">
              Questions or need a different time? Call{" "}
              <a
                href={site.business.phoneHref}
                onClick={() => trackPhoneClick("book-confirmed")}
                className="text-accent"
              >
                {site.business.phone}
              </a>
              .
            </p>
          </div>

          <Link
            to="/"
            className="mt-8 inline-block text-sm text-muted-foreground underline underline-offset-4"
          >
            Back to the homepage
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
