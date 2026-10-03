import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { BookingForm } from "@/components/site/BookingForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { site } from "@/config/site";
import { seo } from "@/lib/seo";
import { trackPhoneClick } from "@/lib/analytics";

const PATH = "/book";
const TITLE = "Book Window Tint Online | Evo Solutions — Albuquerque";
const DESC =
  "Book carbon or ceramic window tint online at Evo Solutions in Albuquerque. Pick a time that fits the whole job and hold your spot with a deposit.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Book Online", path: PATH },
];

export const Route = createFileRoute("/book/")({
  // `service` preselects a service by its name key, e.g. /book?service=ceramic-tint
  validateSearch: (s: Record<string, unknown>): { service?: string } =>
    typeof s.service === "string" ? { service: s.service } : {},
  // noindex: this is the one page with prices on it (site.booking), and the
  // owner's call is that prices don't travel — search snippets included.
  head: () => seo({ title: TITLE, description: DESC, path: PATH, noindex: true }),
  component: Book,
});

function Book() {
  const { service } = Route.useSearch();
  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x pb-16 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />
          <div className="mt-8 max-w-2xl animate-rise">
            <p className="eyebrow">Book window tint online</p>
            <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.4rem)]">
              Pick a time. Hold it with a deposit.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Know which film you want? Book it here. Every time shown has room for the whole job.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" />
                {site.business.addressParts.street}, {site.business.addressParts.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                Mon–Sat
              </span>
              <a
                href={site.business.phoneHref}
                onClick={() => trackPhoneClick("book-page")}
                className="flex items-center gap-1.5 text-accent"
              >
                <Phone className="h-4 w-4" />
                {site.business.phone}
              </a>
            </p>
          </div>

          <div className="mt-10">
            <BookingForm preset={service} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
