import { ArrowUpRight, Check } from "lucide-react";
import { site, type ServiceKey } from "@/config/site";
import { Reveal } from "./Reveal";

// Map each catalog service to its dedicated page.
const pageFor: Record<ServiceKey, string> = {
  tint: "/window-tint",
  ceramic: "/ceramic-coating",
  ppf: "/paint-protection-film",
  detail: "/detailing",
};

export function Services() {
  return (
    <section id="services" className="py-24 sm:py-32 bg-surface/30">
      <div className="container-x">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Our Services</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              Built around window tint. Elevated by everything else.
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Every service is performed in-house by certified specialists using top-tier
            products and factory-precise technique.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {site.services.map((s, i) => (
            <Reveal
              key={s.key}
              delay={i * 80}
              className="group relative overflow-hidden rounded-3xl hairline bg-card"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                  width={1400}
                  height={875}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute top-4 left-4 rounded-full glass px-3 py-1 text-xs uppercase tracking-[0.15em] text-foreground/80">
                  {s.tag}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-3xl">{s.name}</h3>
                  <a
                    href={pageFor[s.key]}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full hairline text-foreground/80 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
                    aria-label={`Learn more about ${s.name}`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.description}</p>

                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                  {s.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-foreground/85">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <a
                  href={pageFor[s.key]}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:brightness-110 transition-all"
                >
                  Learn more about {s.name}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
