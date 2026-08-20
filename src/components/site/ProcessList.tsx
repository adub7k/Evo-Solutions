import { Reveal } from "./Reveal";

/**
 * Numbered process. Deliberately a list with rules rather than five cards —
 * cards make five equal steps read as five unrelated features.
 */
export function ProcessList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="mt-10 border-t border-border">
      {steps.map((s, i) => (
        <Reveal
          as="li"
          key={s.title}
          delay={i * 50}
          className="grid grid-cols-[2.5rem_1fr] gap-x-5 border-b border-border py-6 sm:grid-cols-[4rem_1fr] sm:gap-x-8"
        >
          <span className="font-display text-lg font-bold tabular-nums text-accent sm:text-2xl">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold sm:text-xl">{s.title}</h3>
            <p className="mt-1.5 leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
