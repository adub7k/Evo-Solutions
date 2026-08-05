// Google Analytics 4 event helpers.
// gtag.js is loaded once in the SSR <head> (see routes/__root.tsx). These
// wrappers are best-effort and safe no-ops when gtag isn't available — during
// SSR, before the script loads, or when an ad/tracker blocker strips it.
// Analytics must NEVER throw into the lead-capture flow.
type Gtag = (command: "event", event: string, params?: Record<string, unknown>) => void;

function gtagEvent(event: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === "function") gtag("event", event, params);
  } catch {
    /* best-effort: never let analytics break the form */
  }
}

// A visitor became a lead — contact details captured (GA4 recommended event).
// Fired once per lead, at the moment the phone/email/name first validate, so it
// mirrors ShopFlow's lead count even when the visitor bails before scheduling.
export function trackLeadCaptured(service: string): void {
  gtagEvent("generate_lead", { service });
}

// A lead completed the flow and requested an appointment (GA4 recommended event).
export function trackAppointmentRequested(service: string): void {
  gtagEvent("book_appointment", { service });
}
