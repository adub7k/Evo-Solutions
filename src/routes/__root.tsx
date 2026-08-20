import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { site } from "../config/site";
import { images } from "../config/images";

/* ------------------------------------------------------------ analytics -- */

const GA4_MEASUREMENT_ID = "G-0KB9XP0PFV";
/** The marketing partner's Google Ads account (conversions + remarketing). */
const GOOGLE_ADS_ID = "AW-17888381819";
/**
 * Meta Pixel. Empty until Angelo's agency supplies an ID — see VERIFY.md.
 * When set, the pixel loads alongside gtag and lib/analytics.ts starts
 * emitting Lead / InitiateCheckout events with no other changes needed.
 */
const META_PIXEL_ID = "";

const gtagInit = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA4_MEASUREMENT_ID}');
gtag('config','${GOOGLE_ADS_ID}');`;

const metaPixelInit = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;
n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;

/* ------------------------------------------------------ structured data -- */

/**
 * One LocalBusiness node for the whole site, emitted from verified data only.
 * aggregateRating comes straight from site.reviews — the same numbers the
 * page displays — so the markup can never claim something the page doesn't.
 */
const localBusinessLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "AutoDetailing",
  "@id": `${site.url}/#business`,
  name: site.business.name,
  alternateName: site.business.formerName,
  url: site.url,
  telephone: site.business.phone,
  email: site.business.email,
  image: site.url + images.share,
  logo: site.url + "/img/evo-solutions-mark-512.png",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.business.addressParts.street,
    addressLocality: site.business.addressParts.city,
    addressRegion: site.business.addressParts.state,
    postalCode: site.business.addressParts.zip,
    addressCountry: site.business.addressParts.country,
  },
  areaServed: [site.serviceArea.primary, ...site.serviceArea.nearby].map((name) => ({
    "@type": "City",
    name,
  })),
  openingHoursSpecification: site.business.hoursSchema.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: site.reviews.rating.toFixed(1),
    reviewCount: String(site.reviews.count),
    bestRating: "5",
  },
  makesOffer: [
    "Window Tint",
    "Ceramic Coating",
    "Paint Protection Film",
    "Auto Detailing",
    "Commercial Window Tint",
  ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
});

const websiteLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.business.name,
  url: site.url,
});

/* ----------------------------------------------------------- boundaries -- */

/** 404 still looks like Evo — logo, real links, and a route back to a quote. */
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-20 text-center">
      <img
        src="/img/evo-solutions-logo-256.png"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 object-contain"
      />
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)]">This page doesn't exist.</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        It may have moved, or the link may be wrong. Everything we do is one tap away.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link to="/quote" className="btn btn-ghost">
          Get a quote
        </Link>
      </div>

      <nav aria-label="Services" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {[
          { to: "/window-tint", label: "Window Tint" },
          { to: "/ceramic-coating", label: "Ceramic Coating" },
          { to: "/paint-protection-film", label: "PPF" },
          { to: "/auto-detailing", label: "Detailing" },
          { to: "/commercial-window-tint", label: "Commercial & Home" },
          { to: "/gallery", label: "Our Work" },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <a
        href={site.business.phoneHref}
        className="mt-8 text-sm text-muted-foreground hover:text-foreground"
      >
        Or call {site.business.phone}
      </a>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md text-center">
        <h1 className="text-3xl">This page didn't load</h1>
        <p className="mt-3 text-muted-foreground">
          Something went wrong on our end. Try again, or call us on {site.business.phone}.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn btn-ghost">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- route -- */

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#12151a" },
      { name: "format-detection", content: "telephone=no" },
      // Per-page routes override these via lib/seo.ts.
      { title: `${site.business.name} — Window Tint, PPF & Detailing in Albuquerque, NM` },
      {
        name: "description",
        content:
          "Window tint, paint protection film, ceramic coating and detailing in Albuquerque, New Mexico. Rated 5.0 on Google. Free quote.",
      },
      { property: "og:image", content: site.url + images.share },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: site.url + images.share },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      { src: `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`, async: true },
      { children: gtagInit },
      ...(META_PIXEL_ID ? [{ children: metaPixelInit }] : []),
      { type: "application/ld+json", children: localBusinessLd },
      { type: "application/ld+json", children: websiteLd },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      /*
       * Favicons are all generated from Evo's own shield. The classic
       * /favicon.ico stays because browsers and Google's favicon crawler
       * request that path by convention even when a <link> is declared —
       * leaving a stale one there is how the wrong mark ends up in search
       * results. It carries 16/32/48px so it stays sharp wherever it's used.
       */
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/img/evo-solutions-mark-512.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        // Only the weights actually used: Archivo 600/700 for display type,
        // Inter 400/500/600 for body and UI. display=swap so text paints in the
        // fallback immediately rather than sitting invisible.
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=Inter:wght@400;500;600&display=swap",
      },
      // The shop's photos are served from the ShopFlow host — warm the
      // connection before the gallery starts requesting them.
      { rel: "preconnect", href: "https://shopflowio.up.railway.app" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Keying on the path replays a short fade when the route changes, so pages
  // arrive rather than snapping in. Not a loading screen — the markup is
  // already there, this only softens the cut.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="page-enter">
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </div>
  );
}
