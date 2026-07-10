import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/config/site";

const TITLE = "New Mexico Window Tint Laws (2026 Guide) | Evo Solutions Albuquerque";
const DESC =
  "What tint is legal in New Mexico? VLT limits by window, windshield rules, reflectivity, and medical exemptions — explained by an Albuquerque tint shop.";

// Statute reference: NMSA 66-3-846.1. Reviewed 2026 — verify before relying;
// the page carries its own disclaimer and we re-check at install time.
const rows = [
  { window: "Windshield", rule: "No tint below the AS-1 line (roughly the top 5–6 inches). Clear UV film is a common legal option." },
  { window: "Front side windows", rule: "20% VLT minimum — much darker than most states allow." },
  { window: "Rear side windows", rule: "20% VLT minimum." },
  { window: "Rear window", rule: "20% VLT minimum. Working side mirrors required if darkened." },
];

export const Route = createFileRoute("/tint-laws-new-mexico")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "https://www.evosolution.org/tint-laws-new-mexico" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SiteLayout>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="container-x max-w-3xl">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Legal Guide · Updated 2026</div>
          <h1 className="mt-4 text-4xl sm:text-6xl text-balance leading-[1.05]">
            New Mexico window tint laws, in plain English.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
            Good news first: New Mexico is one of the friendliest tint states in the country.
            The legal limit is <span className="text-foreground">20% VLT</span> on every window
            except the windshield — dark enough for serious heat rejection and privacy without
            breaking a rule. Here's exactly where the lines are.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-x max-w-3xl">
          <Reveal className="overflow-hidden rounded-3xl hairline">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface/60 text-left">
                  <th className="px-5 py-4 font-medium uppercase tracking-[0.15em] text-xs text-muted-foreground">Window</th>
                  <th className="px-5 py-4 font-medium uppercase tracking-[0.15em] text-xs text-muted-foreground">New Mexico rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r) => (
                  <tr key={r.window} className="bg-card/40">
                    <td className="px-5 py-4 font-medium whitespace-nowrap align-top">{r.window}</td>
                    <td className="px-5 py-4 text-muted-foreground leading-relaxed">{r.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal className="mt-10 space-y-6 text-muted-foreground leading-relaxed">
            <h2 className="text-3xl text-foreground">What "20% VLT" actually means</h2>
            <p>
              VLT — visible light transmission — is the percentage of light that passes through
              the glass <em>and</em> film together. Lower number, darker window. A 20% film on
              factory glass usually measures slightly under 20% combined, which is why cheap
              installs fail roadside meter checks. We meter every install so yours doesn't.
            </p>
            <h2 className="text-3xl text-foreground">Reflectivity and color</h2>
            <p>
              New Mexico prohibits highly reflective, mirrored films. The ceramic and carbon
              films we install are non-metallic and non-mirrored — they reject heat through
              ceramic particles, not mirror shine, so they're compliant by construction.
            </p>
            <h2 className="text-3xl text-foreground">Medical exemptions</h2>
            <p>
              Drivers with light-sensitive medical conditions can qualify for darker film with
              documentation from a physician. If that's you, bring the paperwork — we'll keep a
              copy on file with your install record.
            </p>
            <h2 className="text-3xl text-foreground">Out-of-state driving</h2>
            <p>
              Tint legal in New Mexico can be ticketable in stricter neighboring states
              (Colorado and Texas front windows, for example, have tighter limits). If you
              commute across state lines regularly, tell us — we'll recommend a shade that keeps
              you clean everywhere you drive.
            </p>
          </Reveal>

          <Reveal className="mt-10 flex items-start gap-3 rounded-2xl hairline bg-card/60 p-5 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
            <p>
              This guide is general information, not legal advice, and laws change. We verify
              current requirements at install time — statute NMSA 66-3-846.1 is the authority.
            </p>
          </Reveal>

          <Reveal className="mt-12 rounded-3xl hairline bg-card p-8 text-center shadow-elevated">
            <ShieldCheck className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-4 text-3xl">Want it dark, legal, and metered?</h2>
            <p className="mt-3 text-muted-foreground">
              Tell us your goals — we'll recommend the exact shade for each window and put it in writing.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/window-tint#quote"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110 transition-all"
              >
                Get My Tint Quote
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={site.business.phoneHref}
                className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3.5 text-sm font-medium hover:bg-surface-elevated transition-colors"
              >
                Call {site.business.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
