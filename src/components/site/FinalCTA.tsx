import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-3xl hairline p-10 sm:p-20 text-center noise">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-surface via-background to-surface" />
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] glow-orb" />

          <div className="text-xs uppercase tracking-[0.24em] text-accent">Ready When You Are</div>
          <h2 className="mt-6 text-4xl sm:text-6xl lg:text-7xl text-balance max-w-4xl mx-auto leading-[1.05]">
            Ready to <span className="ember-text italic">upgrade</span> your vehicle?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Get your free tint quote today — no obligation, no pressure. Just great
            work at a fair price.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#quote"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110 transition-all"
            >
              Get My Free Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={site.business.phoneHref}
              className="inline-flex items-center gap-2 rounded-full hairline bg-background/50 px-7 py-4 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Phone className="h-4 w-4" />
              {site.business.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
