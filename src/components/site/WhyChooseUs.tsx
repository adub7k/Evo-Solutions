import { Award, UserCheck, ShieldCheck, Sparkles, HeartHandshake, Timer } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

const icons = [Award, UserCheck, ShieldCheck, Sparkles, HeartHandshake, Timer];

export function WhyChooseUs() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] glow-orb" />

      <div className="container-x relative">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          <Reveal className="lg:sticky lg:top-32">
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Why Choose Us</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              The details others miss are the ones we obsess over.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              You get a shop that treats your vehicle like the investment it is —
              certified installers, premium materials, and a warranty that stands
              behind every square inch.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {site.whyChoose.map((r, i) => {
              const Icon = icons[i];
              return (
                <Reveal
                  key={r.title}
                  delay={i * 70}
                  className="group rounded-2xl hairline bg-card p-6 hover:bg-surface transition-colors"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
