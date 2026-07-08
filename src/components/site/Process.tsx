import { site } from "@/config/site";
import { Reveal } from "./Reveal";

export function Process() {
  return (
    <section className="py-24 sm:py-32 bg-surface/30">
      <div className="container-x">
        <Reveal className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">How It Works</div>
          <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
            From quote to keys — a process built for busy people.
          </h2>
        </Reveal>

        <div className="relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent" />

          <ol className="space-y-8 sm:space-y-16">
            {site.process.map((p, i) => (
              <Reveal
                key={p.step}
                as="li"
                delay={i * 80}
                className={`relative flex sm:grid sm:grid-cols-2 sm:gap-16 items-start ${
                  i % 2 === 1 ? "sm:[&>*:first-child]:col-start-2" : ""
                }`}
              >
                <div className={`pl-14 sm:pl-0 ${i % 2 === 1 ? "sm:text-right sm:pr-16" : "sm:pl-16"}`}>
                  <div className="text-xs uppercase tracking-[0.24em] text-accent/80">Step {p.step}</div>
                  <h3 className="mt-2 text-2xl sm:text-3xl">{p.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed max-w-md sm:inline-block">
                    {p.body}
                  </p>
                </div>

                <div
                  className={`absolute left-0 sm:left-1/2 top-1 -translate-x-0 sm:-translate-x-1/2 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-background hairline`}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
