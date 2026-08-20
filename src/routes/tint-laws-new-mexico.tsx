import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";
import { seo, faqLd, breadcrumbLd } from "@/lib/seo";

const PATH = "/tint-laws-new-mexico";
const TITLE = "New Mexico Window Tint Laws (2026) — VLT Limits Explained | Evo Solutions";
const DESC =
  "What tint is legal in New Mexico: VLT limits per window, the windshield AS-1 rule, reflectivity and medical exemptions — explained by an Albuquerque tint shop.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
  { name: "New Mexico Tint Laws", path: PATH },
];

/**
 * Statute reference: NMSA 66-3-846.1. Reviewed for 2026. The page carries its
 * own disclaimer and points at the statute — we don't present this as legal
 * advice, and requirements get re-checked at install time.
 */
const rows = [
  {
    window: "Windshield",
    rule: "No tint below the AS-1 line (roughly the top five to six inches). A non-reflective strip above it is permitted, and clear or near-clear UV film is a common legal choice for the full screen.",
  },
  {
    window: "Front side windows",
    rule: "Must allow more than 20% of light through — darker than most states permit.",
  },
  { window: "Rear side windows", rule: "More than 20% VLT." },
  {
    window: "Rear window",
    rule: "More than 20% VLT. Keep both side mirrors usable if the rear glass is darkened.",
  },
  { window: "Reflectivity", rule: "Highly reflective and mirrored finishes are not permitted." },
];

const faqs = [
  {
    q: "What is the darkest legal tint in New Mexico?",
    a: "20% VLT on the front sides, rear sides and rear window. The windshield is limited to non-reflective film above the AS-1 line. New Mexico is more permissive than most states — 20% is a genuine privacy shade.",
  },
  {
    q: "Does the limit apply to the film or the whole window?",
    a: "The measurement is the film and the glass together. Factory glass already blocks some light, so a 20% film on tinted factory glass can measure under the legal limit — which is why cheap installs sometimes fail a roadside check.",
  },
  {
    q: "Can I get a medical exemption for darker tint?",
    a: "New Mexico allows exemptions for documented light-sensitive medical conditions. You'll need paperwork from a physician. Bring it when you come in and we'll keep a copy with your install record.",
  },
  {
    q: "Is my New Mexico tint legal in other states?",
    a: "Not necessarily. Neighbouring states have tighter front-window limits, so tint that's fine here can be ticketable elsewhere. If you regularly drive across state lines, tell us and we'll recommend a shade that keeps you clean in both.",
  },
];

export const Route = createFileRoute("/tint-laws-new-mexico")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESC, path: PATH });
    return {
      ...meta,
      scripts: [
        { type: "application/ld+json", children: faqLd(faqs) },
        { type: "application/ld+json", children: breadcrumbLd(CRUMBS) },
      ],
    };
  },
  component: TintLaws,
});

function TintLaws() {
  return (
    <SiteLayout>
      <article className="pt-[4.5rem]">
        <header className="container-prose pb-8 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />
          <p className="eyebrow mt-8">Legal guide · Reviewed 2026</p>
          <h1 className="mt-3 text-[clamp(2rem,4.6vw,3.1rem)]">
            New Mexico window tint laws, in plain English.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            The good news first: New Mexico is one of the friendlier tint states in the country. The
            limit is 20% VLT on every window except the windshield — dark enough for serious privacy
            and heat rejection without breaking a rule.
          </p>
        </header>

        <div className="container-prose pb-14">
          <Reveal className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">New Mexico window tint limits by window</caption>
              <thead>
                <tr className="bg-surface">
                  <th
                    scope="col"
                    className="px-5 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Window
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    New Mexico rule
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.window}>
                    <th scope="row" className="w-40 px-5 py-4 align-top font-medium">
                      {r.window}
                    </th>
                    <td className="px-5 py-4 leading-relaxed text-muted-foreground">{r.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <h2 className="mt-11 text-[clamp(1.4rem,2.6vw,1.9rem)]">What 20% VLT actually means</h2>
          <p className="mt-4 text-[1.0625rem] leading-[1.75] text-muted-foreground">
            VLT stands for visible light transmission — the percentage of visible light that makes
            it through. Lower number, darker window. The figure that matters legally is the film{" "}
            <em>and</em> your glass together, not the film on its own. Factory glass already blocks
            some light, so a 20% film on already-tinted glass measures darker than 20% combined.
          </p>

          <h2 className="mt-11 text-[clamp(1.4rem,2.6vw,1.9rem)]">Reflectivity and colour</h2>
          <p className="mt-4 text-[1.0625rem] leading-[1.75] text-muted-foreground">
            Mirrored and highly reflective films are not permitted. Carbon and ceramic films are
            non-metallic and non-mirrored — they reject heat through their construction rather than
            by reflecting it, so they're compliant on that count by design.
          </p>

          <h2 className="mt-11 text-[clamp(1.4rem,2.6vw,1.9rem)]">Medical exemptions</h2>
          <p className="mt-4 text-[1.0625rem] leading-[1.75] text-muted-foreground">
            Drivers with documented light-sensitive conditions can qualify for darker film. Bring
            the paperwork from your physician and we'll keep a copy on file with your install
            record.
          </p>

          <h2 className="mt-11 text-[clamp(1.4rem,2.6vw,1.9rem)]">Driving out of state</h2>
          <p className="mt-4 text-[1.0625rem] leading-[1.75] text-muted-foreground">
            Tint that's legal here can be ticketable in stricter neighbouring states — front side
            windows are the usual problem. If you commute across a state line, say so when you get
            your quote and we'll recommend a combination that works in both.
          </p>

          <aside className="mt-10 flex gap-3 rounded-lg border border-border bg-surface/50 p-5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is general information, not legal advice, and the law can change. New Mexico
              statute NMSA 66-3-846.1 is the authority — we re-check current requirements at install
              time and will always recommend a compliant shade.
            </p>
          </aside>

          <h2 className="mt-12 text-[clamp(1.4rem,2.6vw,1.9rem)]">Common questions</h2>
          <div className="mt-6 space-y-7">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-lg font-semibold">{f.q}</h3>
                <p className="mt-2 text-[1.0625rem] leading-[1.7] text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>

          <Reveal className="mt-12 rounded-lg border border-border bg-surface/50 p-6 sm:p-7">
            <p className="eyebrow">Next step</p>
            <h2 className="mt-2.5 font-display text-2xl">Want it dark and legal?</h2>
            <p className="mt-2.5 leading-relaxed text-muted-foreground">
              Tell us how you use the car and we'll recommend a shade per window that stays within
              the limit — and put it in writing before we start.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/window-tint" className="btn btn-primary">
                See window tint
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/guides/$slug"
                params={{ slug: "what-tint-percentage-should-i-get" }}
                className="btn btn-ghost"
              >
                Which percentage should I pick?
              </Link>
            </div>
          </Reveal>
        </div>
      </article>

      <FinalCTA location="tint-laws-final" />
    </SiteLayout>
  );
}
