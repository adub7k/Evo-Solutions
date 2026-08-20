import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

/**
 * Before/after comparison slider.
 *
 * Only ever rendered from a genuine pair — same car, same angle, same framing.
 * See `beforeAfterPairs` in content/gallery.ts: it's empty until Angelo shoots
 * real pairs, and faking one from two unrelated photos is exactly the kind of
 * thing this site avoids.
 *
 * Driven by pointer events so mouse, touch and pen all take the same path, and
 * fully keyboard operable via a real range input underneath — arrow keys move
 * the handle, which is what a screen-reader user or anyone without a mouse
 * actually needs.
 */
export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel = "Before",
  afterLabel = "After",
  ratio = "4/3",
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  ratio?: string;
}) {
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Damped a touch at the extremes so the handle doesn't feel twitchy.
    const next = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  return (
    <div className="select-none">
      <div
        ref={frame}
        className="framed relative cursor-ew-resize touch-pan-y"
        style={{ aspectRatio: ratio }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
        onPointerUp={(e) => {
          dragging.current = false;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* After sits underneath; before is clipped over the top. */}
        <img
          src={after}
          alt={afterAlt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt={beforeAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.12em] text-white">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.12em] text-white">
          {afterLabel}
        </span>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            <MoveHorizontal className="h-4 w-4" />
          </span>
        </div>

        <div className="framed-rule" />
      </div>

      {/* The real control: keyboard accessible, visually minimal. */}
      <label className="mt-3 block">
        <span className="sr-only">Reveal more of the before or after photo</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${Math.round(pos)}% before`}
          className="h-1 w-full cursor-ew-resize appearance-none rounded-full bg-surface-2 accent-[var(--accent)]"
        />
      </label>
    </div>
  );
}
