import { useEffect, useState } from "react";
import { site } from "@/config/site";

/**
 * Paid-traffic channel config, shared by every ad landing page (/tint, /ppf).
 *
 * `?src=google` / `?src=meta` on the ad's final URL picks the row; no
 * parameter (or an unconfigured row) falls back to the shop's real number.
 * These are the only knobs a campaign should ever need — the pages read them,
 * they don't define them.
 *
 * Tracking numbers don't exist yet — the Twilio call-tracking build is still
 * pending — so both are null placeholders:
 *   google: {{GOOGLE_TRACKING_NUMBER}}  e.g. { display: "(505) 555-0100", href: "tel:+15055550100" }
 *   meta:   {{META_TRACKING_NUMBER}}
 */

export type ChannelPhone = { display: string; href: string };
export type ChannelSrc = "google" | "meta";

export const CHANNEL = {
  phones: {
    default: { display: site.business.phone, href: site.business.phoneHref } as ChannelPhone,
    google: null as ChannelPhone | null,
    meta: null as ChannelPhone | null,
  },
  /**
   * Meta offer bar. The Meta creatives carry the offer, so ?src=meta has to
   * confirm it on landing — and Google traffic, which has no offer context,
   * must never see it. Empty string = the bar never renders. Set it ONLY once
   * Angelo confirms he'll honor the offer (this site publishes no unverified
   * commitments): e.g. "Free windshield strip with any full vehicle tint".
   */
  metaOffer: "", // {{META_OFFER_TEXT}}
};

export function useChannel(metaOffer: string = CHANNEL.metaOffer): {
  src: ChannelSrc | null;
  phone: ChannelPhone;
  offer: string | null;
} {
  // Read post-mount: query strings don't change the server HTML, and the
  // first client render has to match it.
  const [src, setSrc] = useState<ChannelSrc | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("src");
    if (p === "google" || p === "meta") setSrc(p);
  }, []);
  return {
    src,
    phone: (src ? CHANNEL.phones[src] : null) ?? CHANNEL.phones.default,
    offer: src === "meta" && metaOffer ? metaOffer : null,
  };
}
