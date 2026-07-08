import { Check, ThermometerSun, ShieldCheck } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

export function Packages() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-surface/30 noise">
      <div className="pointer-events-none absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="container-x relative">
        <Reveal className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Transparent Pricing</div>
          <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
            Flat-rate packages. No surprises at pickup.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Every package includes full prep, edge-to-edge computer-cut film, and our
            lifetime warranty. The price we quote is the price you pay.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {site.packages.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 100}
              className={`relative flex flex-col rounded-3xl p-8 ${
                p.featured
                  ? "bg-card shadow-elevated ring-1 ring-accent/40 shadow-glow"
                  : "hairline bg-card/60"
              }`}
            >
              <div
                className={`text-xs uppercase tracking-[0.2em] ${
                  p.featured ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {p.tag}
              </div>
              <h3 className="mt-3 text-3xl">{p.name}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.blurb}</p>

              <div className="mt-6 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <ThermometerSun className="h-4 w-4 text-accent shrink-0" />
                  {p.heatRejection}
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                  {p.warranty} warranty
                </div>
              </div>

              <div className="mt-8 flex-1">
                <div className="rounded-2xl hairline bg-surface/50 divide-y divide-border/60">
                  {p.prices.map((row) => (
                    <div key={row.vehicle} className="flex items-baseline justify-between px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{row.vehicle}</span>
                      <span className="font-display text-xl">{row.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#quote"
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-all ${
                  p.featured
                    ? "bg-accent text-accent-foreground shadow-glow hover:brightness-110"
                    : "hairline text-foreground hover:bg-surface-elevated"
                }`}
              >
                <Check className="h-4 w-4" />
                Get {p.name} Quote
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <p className="text-center text-xs text-muted-foreground/80">
            Prices shown are starting points for standard glass. Steep rake, older film
            removal, or specialty glass may adjust the quote — always confirmed before we start.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
