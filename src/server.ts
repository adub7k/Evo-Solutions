import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { services } from "./content/services";
import { guides } from "./content/guides";

const SITE = "https://www.evosolution.org";

/**
 * Permanent redirects for URLs the previous version of the site published.
 *
 * The site is live and running Google Ads, so old paths are in ad
 * destinations, the Google index and people's bookmarks. Dropping them would
 * throw away the ranking they've built and send paid clicks to a 404.
 */
const REDIRECTS: Record<string, string> = {
  "/detailing": "/auto-detailing",
  "/commercial-tint": "/commercial-window-tint",
  "/fleet-tinting": "/commercial-window-tint",
  "/blog": "/guides",
  // Old post slugs → their closest current guide.
  "/blog/what-tint-percentage-should-i-get": "/guides/what-tint-percentage-should-i-get",
  "/blog/ceramic-vs-carbon-vs-dyed-tint": "/guides/ceramic-vs-carbon-window-tint",
  "/blog/new-tint-care-first-30-days": "/guides/how-long-does-window-tint-take-to-cure",
  "/blog/ppf-vs-ceramic-coating": "/guides/ppf-vs-ceramic-coating",
  // No direct equivalent — the coating page carries the wash guidance.
  "/blog/how-to-wash-ceramic-coated-car": "/ceramic-coating",
};

function redirectResponse(pathname: string): Response | null {
  // Tolerate a trailing slash so /detailing/ redirects too.
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const target = REDIRECTS[clean];
  if (!target) return null;
  return new Response(null, { status: 301, headers: { location: target } });
}

/**
 * Sitemap and robots are generated here so they always reflect the real route
 * list without a separate build step. Priorities are deliberate: the service
 * pages are the paid-traffic landing pages and the money keywords.
 */
function buildSitemap(): string {
  const entries: { path: string; priority: string; changefreq: string }[] = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    ...services.map((s) => ({ path: `/${s.slug}`, priority: "0.9", changefreq: "monthly" })),
    { path: "/quote", priority: "0.8", changefreq: "monthly" },
    { path: "/gallery", priority: "0.7", changefreq: "weekly" },
    { path: "/reviews", priority: "0.6", changefreq: "monthly" },
    { path: "/about", priority: "0.6", changefreq: "monthly" },
    { path: "/contact", priority: "0.6", changefreq: "monthly" },
    { path: "/tint-laws-new-mexico", priority: "0.8", changefreq: "yearly" },
    { path: "/guides", priority: "0.6", changefreq: "weekly" },
    ...guides.map((g) => ({ path: `/guides/${g.slug}`, priority: "0.5", changefreq: "yearly" })),
  ];

  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${SITE}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

function staticFileResponse(pathname: string): Response | null {
  if (pathname === "/sitemap.xml") {
    return new Response(buildSitemap(), {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }
  if (pathname === "/robots.txt") {
    return new Response(ROBOTS, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }
  return null;
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const { pathname } = new URL(request.url);
      const redirect = redirectResponse(pathname);
      if (redirect) return redirect;
      const staticFile = staticFileResponse(pathname);
      if (staticFile) return staticFile;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
