import { ArrowRight, Phone, Star, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { site } from "@/config/site";

const badges = [
  { icon: Star, label: "4.9★ Reviews" },
  { icon: ShieldCheck, label: "Lifetime Warranty" },
  { icon: Sparkles, label: "Premium Films" },
  { icon: Wrench, label: "Certified Install" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 noise">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=85"
          alt=""
          className="h-full w-full object-cover object-center opacity-40"
          width={2400}
          height={1600}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/4 -z-10 h-[500px] w-[500px] glow-orb" />

      <div className="container-x relative">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            {site.business.tagline}
          </div>

          <h1 className="mt-6 text-balance text-4xl sm:text-6xl lg:text-7xl leading-[1.05]">
            Premium window tint that keeps your vehicle{" "}
            <span className="ember-text italic">cooler, protected, </span>
            and looking better.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base sm:text-lg text-muted-foreground leading-relaxed">
            Professional installation using premium ceramic films engineered for maximum
            heat rejection, UV protection, privacy, and unmistakable style.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#quote"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110 transition-all"
            >
              Get My Free Tint Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={site.business.phoneHref}
              className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3.5 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {badges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <b.icon className="h-4 w-4 text-accent" />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
