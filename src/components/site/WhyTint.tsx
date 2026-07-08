import { Thermometer, Sun, Eye, Sofa, Sparkle, Leaf } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

const icons = [Thermometer, Sun, Eye, Sofa, Sparkle, Leaf];

export function WhyTint() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Why Window Tint</div>
          <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
            Six reasons drivers upgrade in the first place.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden rounded-2xl hairline">
          {site.reasons.map((r, i) => {
            const Icon = icons[i];
            return (
              <Reveal
                key={r.title}
                delay={i * 60}
                className="group relative bg-background p-8 sm:p-10 transition-colors hover:bg-surface"
              >
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-6 text-2xl">{r.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{r.body}</p>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
