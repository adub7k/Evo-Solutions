import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

export function Testimonials() {
  const [i, setI] = useState(0);
  const count = site.testimonials.length;
  const t = site.testimonials[i];

  const go = (delta: number) => setI((prev) => (prev + delta + count) % count);

  return (
    <section id="reviews" className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Reviews</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              Real drivers. Real results.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(-1)}
              className="grid h-11 w-11 place-items-center rounded-full hairline hover:bg-surface-elevated transition"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="grid h-11 w-11 place-items-center rounded-full hairline hover:bg-surface-elevated transition"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        <div className="relative overflow-hidden rounded-3xl hairline bg-card p-8 sm:p-14 min-h-[360px]">
          <Quote className="absolute top-8 right-8 h-24 w-24 text-accent/10" />
          <div key={i} className="animate-fade-up">
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, k) => (
                <Star key={k} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
            <p className="mt-6 text-2xl sm:text-3xl leading-snug font-display text-balance max-w-3xl">
              "{t.quote}"
            </p>
            <div className="mt-10 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full ember-gradient text-primary-foreground font-display text-lg">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-muted-foreground">
                  {[t.vehicle, t.service].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-2">
            {site.testimonials.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                className={`h-1 rounded-full transition-all ${
                  k === i ? "w-10 bg-accent" : "w-4 bg-border-strong"
                }`}
                aria-label={`Go to review ${k + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
