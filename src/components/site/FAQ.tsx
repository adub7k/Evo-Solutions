import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.24em] text-accent">FAQ</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              Everything drivers ask us — answered.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Don't see your question? Give us a call or drop us a message —
              we're happy to help.
            </p>
          </Reveal>

          <div className="divide-y divide-border">
            {site.faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={f.q} delay={i * 40} className="py-2">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="w-full text-left py-5 flex items-start justify-between gap-6"
                  >
                    <span className="text-lg sm:text-xl font-display text-foreground pr-4">
                      {f.q}
                    </span>
                    <span
                      className={`shrink-0 grid h-9 w-9 place-items-center rounded-full hairline transition-all ${
                        isOpen ? "bg-accent text-accent-foreground border-accent" : ""
                      }`}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    className={`grid transition-all duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-muted-foreground leading-relaxed max-w-2xl">{f.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
