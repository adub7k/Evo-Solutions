import { useId, useState } from "react";
import { Info } from "lucide-react";

/**
 * The little "what is this?" next to an add-on. Tap (or focus + Enter) the
 * icon and the owner's one-or-two-sentence note from ShopFlow opens inline
 * underneath, instead of a hover tooltip that phones can't reach. Renders
 * nothing when the owner hasn't written one, so a bare add-on list stays
 * exactly as it was.
 *
 * Drop it inside a `flex flex-wrap` row: the wrapper is `display: contents`,
 * so the icon sits in the row where it's placed and the open note takes a
 * full-width line at the end of the row (`basis-full order-last`).
 */
export function AddonInfo({
  text,
  name,
}: {
  text: string;
  /** The add-on's name, for the button's accessible label. */
  name: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <span className="contents">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`What's ${name}?`}
        onClick={(e) => {
          // Inside a <label> the click would also toggle the checkbox.
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`inline-grid h-5 w-5 place-items-center rounded-full align-middle transition-colors ${
          open ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-accent"
        }`}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className="order-last mt-1 block basis-full rounded-md border border-border bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
        >
          {text}
        </span>
      )}
    </span>
  );
}
