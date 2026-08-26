/**
 * Analytics event layer.
 *
 * gtag.js is loaded once in the SSR <head> (routes/__root.tsx) and feeds two
 * destinations: GA4 (G-0KB9XP0PFV) and the marketing partner's Google Ads
 * account (AW-17888381819). A Meta Pixel is loaded from the same place when a
 * pixel ID is configured.
 *
 * Every helper here is best-effort and a no-op when the tag isn't available —
 * during SSR, before the script loads, or when a blocker strips it. Analytics
 * must NEVER throw into the lead-capture flow: a broken tracker may not cost
 * Angelo a lead.
 */

type Gtag = (
  command: "event" | "config" | "js",
  target: string,
  params?: Record<string, unknown>,
) => void;

type Fbq = (command: string, event: string, params?: Record<string, unknown>) => void;

function gtagEvent(event: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === "function") gtag("event", event, params);
  } catch {
    /* never let analytics break the page */
  }
}

function fbqEvent(event: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window === "undefined") return;
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (typeof fbq === "function") fbq("track", event, params);
  } catch {
    /* no-op */
  }
}

/* --------------------------------------------------------------- intent -- */

/** Any "get a quote" button, anywhere. `location` names the section. */
export function trackQuoteClick(location: string, service?: string): void {
  gtagEvent("quote_cta_click", { location, service: service ?? "unspecified" });
}

/** tel: link tapped. The highest-intent action on mobile after a form submit. */
export function trackPhoneClick(location: string): void {
  gtagEvent("phone_click", { location });
  fbqEvent("Contact", { method: "phone" });
}

/** mailto: or the contact page form. */
export function trackContactClick(method: "email" | "directions" | "map"): void {
  gtagEvent("contact_click", { method });
}

/* ----------------------------------------------------------------- form -- */

/** Fired once, when the visitor interacts with the quote form for real. */
export function trackQuoteStart(service: string): void {
  gtagEvent("quote_start", { service });
  fbqEvent("InitiateCheckout", { content_category: service });
}

/** Each completed step — this is what shows you where people drop out. */
export function trackQuoteStep(stepIndex: number, stepName: string, service: string): void {
  gtagEvent("quote_step", { step_index: stepIndex, step_name: stepName, service });
}

/**
 * A visitor became a lead — contact details captured and sent to ShopFlow.
 * Fires once per phone number, at the moment contact details validate, so it
 * mirrors ShopFlow's lead count even if the visitor bails afterwards.
 */
export function trackLeadCaptured(service: string): void {
  gtagEvent("generate_lead", { service, currency: "USD", value: 1 });
  fbqEvent("Lead", { content_category: service });
}

/** Marketing partner's Google Ads conversion ("EVO Quote Form Submit"). */
const GOOGLE_ADS_QUOTE_CONVERSION = "AW-17888381819/3RgDCMWTxNwcEPuW7NFC";
export function trackQuoteAdsConversion(): void {
  gtagEvent("conversion", { send_to: GOOGLE_ADS_QUOTE_CONVERSION });
}

/** The form reached its success state. */
export function trackQuoteComplete(service: string): void {
  gtagEvent("quote_complete", { service });
}

/** The form failed to reach ShopFlow — worth alerting on in GA4. */
export function trackQuoteError(reason: string): void {
  gtagEvent("quote_error", { reason });
}

/**
 * A paid-traffic landing page was viewed. Meta optimises delivery on the
 * events it sees, so the ad-landing pages report ViewContent on arrival and
 * Lead on submit — the two ends of the funnel Ads Manager needs to learn from.
 * The generic site PageView still fires from the pixel snippet in __root.
 */
export function trackLandingView(service: string): void {
  gtagEvent("landing_view", { service });
  fbqEvent("ViewContent", { content_category: service, content_name: service });
}

/* -------------------------------------------------------------- content -- */

export function trackGalleryFilter(filter: string): void {
  gtagEvent("gallery_filter", { filter });
}

export function trackGalleryOpen(caption: string): void {
  gtagEvent("gallery_open", { caption });
}

export function trackGuideRead(slug: string): void {
  gtagEvent("guide_read", { slug });
}
