import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * FAQ accordion.
 *
 * Height animates with the grid 0fr → 1fr technique: no measuring, no JS on
 * the animation frame, and it works with content of any length. One panel open
 * at a time keeps the list scannable — with a dozen questions, allowing all of
 * them open turns the section into a wall.
 *
 * The panel stays in the DOM (rather than being unmounted) so closing animates
 * too, and `inert` keeps collapsed answers out of the tab order and off screen
 * readers while they're hidden.
 */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="mt-10 border-t border-border">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q} className="border-b border-border">
            <h3>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-btn-${i}`}
                className="group flex w-full items-start justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-[1.0625rem] font-semibold leading-snug transition-colors group-hover:text-accent sm:text-lg">
                  {f.q}
                </span>
                <ChevronDown
                  className={`mt-1 h-5 w-5 shrink-0 text-accent transition-transform duration-300 ease-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-10 leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
