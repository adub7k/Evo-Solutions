// Lead capture client for the ShopFlow public API.
// Endpoints (server: shopflow-platform routes/public.js):
//   POST /api/public/:slug/lead          — create/update lead (deduped by phone)
//   GET  /api/public/:slug/availability  — real open slots for a date
//   POST /api/public/:slug/upload        — photo upload (data URL → hosted URL)
import { publicApi } from "@/config/shopflow";

/* ---------------- validation ---------------- */

export const phoneDigits = (v: string) => v.replace(/\D/g, "");
export const isValidPhone = (v: string) => {
  const d = phoneDigits(v);
  return d.length === 10 || (d.length === 11 && d.startsWith("1"));
};
export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isValidYear = (v: string) => {
  const n = Number(v);
  return /^\d{4}$/.test(v.trim()) && n >= 1950 && n <= new Date().getFullYear() + 2;
};

/* ---------------- ad attribution ----------------
 * First-touch utm_* params are captured once per session so a visitor who
 * browses around before submitting still credits the ad click. */

const UTM_KEY = "sf_attribution";

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(UTM_KEY)) return;
    const p = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const k of ["source", "medium", "campaign", "term", "content"]) {
      const v = p.get(`utm_${k}`);
      if (v) utm[k] = v;
    }
    sessionStorage.setItem(
      UTM_KEY,
      JSON.stringify({ utm, referrer: document.referrer || "", landing: window.location.pathname })
    );
  } catch {
    /* sessionStorage unavailable (private mode) — attribution is best-effort */
  }
}

function getAttribution(): { utm: Record<string, string>; referrer: string } {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through */
  }
  return { utm: {}, referrer: typeof document !== "undefined" ? document.referrer : "" };
}

/* ---------------- API calls ---------------- */

export type LeadInput = {
  name: string;
  phone: string;
  email: string;
  service: string;
  goal: string;
  timeline: string;
  notes: string;
  vehicle: { year: string; make: string; model: string; color: string; type: string };
  appointment?: { date: string; time: string }; // human-readable request
  photoUrls?: string[];
  honeypot?: string; // hidden "website" field — bots fill it, humans never see it
};

export async function submitLead(input: LeadInput): Promise<{ ok: boolean; error?: string }> {
  const { utm, referrer } = getAttribution();

  // The structured request lives in notes so it survives any tenant's
  // lead-form option list (the server drops `services` labels it doesn't know).
  const noteLines = [
    `Service: ${input.service}`,
    input.vehicle.type && `Vehicle type: ${input.vehicle.type}`,
    input.goal && `Goal: ${input.goal}`,
    input.timeline && `Timeline: ${input.timeline}`,
    input.appointment && `Requested appointment: ${input.appointment.date} at ${input.appointment.time}`,
    input.photoUrls?.length && `Photos: ${input.photoUrls.join(" ")}`,
    input.notes && `Customer note: ${input.notes}`,
  ].filter(Boolean);

  try {
    const res = await fetch(publicApi("/lead"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        notes: noteLines.join("\n"),
        services: [input.service],
        customFields: {
          vehicleYear: input.vehicle.year.trim(),
          vehicleMake: input.vehicle.make.trim(),
          vehicleModel: input.vehicle.model.trim(),
          vehicleColor: input.vehicle.color.trim(),
        },
        utm,
        referrer,
        website: input.honeypot || "",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.ok === false) {
      return { ok: false, error: body.error || `Request failed (${res.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}

// Real open slots for a date ("9:00 AM" strings). Empty array = fully booked
// or closed; null = the API couldn't be reached (caller falls back).
export async function fetchAvailability(dateISO: string): Promise<string[] | null> {
  try {
    const res = await fetch(publicApi(`/availability?date=${dateISO}`));
    if (!res.ok) return null;
    const slots = await res.json();
    return Array.isArray(slots) ? slots : null;
  } catch {
    return null;
  }
}

/* ---------------- photo upload ----------------
 * Phone photos are 3–12 MB; the API accepts JSON data URLs, so downscale
 * client-side to keep uploads fast and under the server's body limit. */

async function downscale(file: File, maxDim = 1600, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

// Uploads up to `max` photos; returns hosted URLs for the ones that made it.
// Failures are non-fatal — the lead still goes through without photos.
export async function uploadPhotos(files: File[], max = 3): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files.slice(0, max)) {
    try {
      const image = await downscale(file);
      const res = await fetch(publicApi("/upload"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok && body.url) urls.push(body.url);
    } catch {
      /* skip this photo */
    }
  }
  return urls;
}
