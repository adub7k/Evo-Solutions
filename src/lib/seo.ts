/**
 * One place that builds page <head> metadata, so every route gets the same
 * complete set: unique title, unique description, canonical, Open Graph and
 * Twitter card. Routes that hand-roll these drift and end up with duplicate
 * canonicals — which is how a small site quietly de-indexes half its pages.
 */

import { site } from "@/config/site";

export type SeoInput = {
  title: string;
  description: string;
  /** Path with a leading slash, e.g. "/window-tint". */
  path: string;
  /** Absolute URL. Falls back to the share image resolved in __root. */
  image?: string;
  type?: "website" | "article";
  /** Set on guide pages so Google can show a date. */
  publishedTime?: string;
  noindex?: boolean;
};

export function canonicalUrl(path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${site.url}${clean}`;
}

export function seo({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  noindex,
}: SeoInput) {
  const url = canonicalUrl(path);
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:site_name", content: site.business.name },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  if (publishedTime) meta.push({ property: "article:published_time", content: publishedTime });
  if (noindex) meta.push({ name: "robots", content: "noindex, follow" });

  return { meta, links: [{ rel: "canonical", href: url }] };
}

/* -------------------------------------------------------- structured data -- */

/** Breadcrumbs help Google render the URL path instead of a bare link. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: canonicalUrl(t.path),
    })),
  });
}

/** FAQPage markup. Only ever built from FAQs actually rendered on the page. */
export function faqLd(faqs: { q: string; a: string }[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

/** Service markup, tied to the local business and the area it really serves. */
export function serviceLd(name: string, description: string, path: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url: canonicalUrl(path),
    provider: {
      "@type": "AutoDetailing",
      name: site.business.name,
      telephone: site.business.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.business.addressParts.street,
        addressLocality: site.business.addressParts.city,
        addressRegion: site.business.addressParts.state,
        postalCode: site.business.addressParts.zip,
        addressCountry: site.business.addressParts.country,
      },
    },
    areaServed: {
      "@type": "City",
      name: site.business.addressParts.city,
    },
  });
}

export function articleLd(a: {
  title: string;
  description: string;
  path: string;
  published: string;
  image?: string;
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.published,
    dateModified: a.published,
    mainEntityOfPage: canonicalUrl(a.path),
    ...(a.image ? { image: a.image } : {}),
    author: { "@type": "Organization", name: site.business.name },
    publisher: {
      "@type": "Organization",
      name: site.business.name,
      url: site.url,
    },
  });
}
