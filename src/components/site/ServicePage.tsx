import { ArrowRight, Check, Phone } from "lucide-react";
import type { ServiceContent } from "@/content/services";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";
import { EstimateForm } from "./EstimateForm";

// Shared template for the four service pages: hero → selling points →
// what's included → mini-FAQ → embedded quote form preselected to the service.
export function ServicePage({ service }: { service: ServiceContent }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="absolute inset-0 -z-10">
          <img
            src={service.image}
            alt=""
            className="h-full w-full object-cover object-center opacity-30"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        </div>
        <div className="container-x">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {service.tag} · Albuquerque, NM
            </div>
            <h1 className="mt-6 text-balance text-4xl sm:text-6xl leading-[1.05]">{service.headline}</h1>
            <p className="mt-6 max-w-xl text-pretty text-base sm:text-lg text-muted-foreground leading-relaxed">
              {service.intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#quote"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110 transition-all"
              >
                Get My {service.navLabel} Quote
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={site.business.phoneHref}
                className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3.5 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                <Phone className="h-4 w-4" />
                {site.business.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Selling points */}
      <section className="py-16 sm:py-24 bg-surface/30 noise">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-3">
            {service.sellingPoints.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="rounded-3xl hairline bg-card/60 p-8">
                <h2 className="text-2xl">{p.title}</h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What's included + FAQ */}
      <section className="py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.24em] text-accent">What's Included</div>
            <h2 className="mt-4 text-3xl sm:text-4xl text-balance">Every job, every time.</h2>
            <ul className="mt-8 space-y-3">
              {service.included.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-2xl hairline bg-card/60 p-5 text-sm text-muted-foreground leading-relaxed">
              {service.priceNote}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Common Questions</div>
            <div className="mt-6 space-y-6">
              {service.faqs.map((f) => (
                <div key={f.q} className="rounded-2xl hairline bg-card/60 p-6">
                  <h3 className="text-xl">{f.q}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
              <a href="/#faq" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                More questions answered
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quote form, preselected to this service */}
      <div className="cv-auto">
        <EstimateForm defaultService={service.serviceName} />
      </div>
    </>
  );
}
