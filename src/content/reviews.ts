/**
 * Customer reviews.
 *
 * These are real reviews read off the shop's Google Business Profile on
 * 2026-07-08. The profile predates the MAD Detailing NM → Evo Solutions
 * rebrand — same business, same owner, same profile — which is why some
 * reviewers refer to detailing rather than film. We say that on the page
 * rather than quietly hiding it.
 *
 * DO NOT ADD A REVIEW HERE THAT ISN'T ON THE PROFILE. Review markup is
 * emitted from this file; invented entries are a Google manual action and an
 * FTC endorsement-guide violation.
 */

export type Review = {
  id: string;
  name: string;
  quote: string;
  rating: 5 | 4 | 3 | 2 | 1;
  /** Only set when the reviewer actually names the service. */
  service?: string;
  source: "Google";
};

export const reviews: Review[] = [
  {
    id: "eric-luchetti",
    name: "Eric Luchetti",
    quote: "Great communication, fast service, excellent workmanship, and an awesome staff.",
    rating: 5,
    source: "Google",
  },
  {
    id: "j-d",
    name: "J D",
    quote: "Good dudes that do solid work for a reasonable price.",
    rating: 5,
    source: "Google",
  },
  {
    id: "debi-smith",
    name: "Debi Smith",
    quote: "Extremely happy with the finish and extra care taken with my new vehicle.",
    rating: 5,
    source: "Google",
  },
];

/** Shown on the reviews page so the rename doesn't read as a discrepancy. */
export const rebrandNote =
  "Evo Solutions traded as MAD Detailing NM until the 2026 rebrand. Same owner, same crew, same shop — and the same Google profile, which is why the earlier reviews mention detailing.";
