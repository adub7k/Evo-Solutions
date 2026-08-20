import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Clock, MapPin, ShieldCheck } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reviews } from "@/components/site/Reviews";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/config/site";
import { seo, breadcrumbLd } from "@/lib/seo";
import { trackPhoneClick } from "@/lib/analytics";

const PATH = "/quote";
const TITLE = "Get a Free Quote | Evo Solutions — Albuquerque";
const DESC =
  "Tell us your vehicle and what you need — window tint, PPF, ceramic coating or detailing. We'll come back with a flat price. No pressure, no obligation.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Get a Quote", path: PATH },
];

const assurances = [
  { icon: ShieldCheck, text: "No obligation — a quote is a quote" },
  { icon: Clock, text: "Usually answered the same day during shop hours" },
  { icon: Phone, text: "We'll text or call, whichever you prefer" },
];

export const Route = createFileRoute("/quote")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESC, path: PATH });
    return {
      ...meta,
      scripts: [{ type: "application/ld+json", children: breadcrumbLd(CRUMBS) }],
    };
  },
  component: Quote,
});

function Quote() {
  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x pb-16 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div className="animate-rise">
              <p className="eyebrow">Free quote</p>
              <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.4rem)]">
                Tell us what you drive. We'll tell you what it costs.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Five short steps, about a minute. You'll get a straight recommendation and a flat
                price — including when the cheaper option is the right one.
              </p>

              <ul className="mt-8 space-y-3.5">
                {assurances.map((a) => (
                  <li key={a.text} className="flex items-start gap-3">
                    <a.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-muted-foreground">{a.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 rounded-lg border border-border bg-surface/50 p-6">
                <p className="font-display font-semibold">Would rather just talk to someone?</p>
                <a
                  href={site.business.phoneHref}
                  onClick={() => trackPhoneClick("quote-page")}
                  className="tap-target mt-2 gap-2 font-display text-xl font-bold text-accent"
                >
                  <Phone className="h-5 w-5" />
                  {site.business.phone}
                </a>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  Mon–Sat, 10:00 AM – 6:00 PM. Walk-ins welcome.
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {site.business.address}
                </p>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Tinting an office, storefront or home? Pick{" "}
                <span className="text-foreground">Commercial &amp; Home Window Tint</span> above and
                the form switches to building questions — or go straight to the{" "}
                <Link
                  to="/commercial-window-tint"
                  className="text-accent underline underline-offset-4"
                >
                  commercial page
                </Link>
                .
              </p>
            </div>

            <Reveal delay={60}>
              <QuoteForm />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="container-x section-y-tight">
          <p className="eyebrow text-center">
            {site.reviews.rating.toFixed(1)} on Google · {site.reviews.count} reviews
          </p>
          <Reviews />
        </div>
      </section>
    </SiteLayout>
  );
}
