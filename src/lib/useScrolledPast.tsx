import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * "Has the visitor scrolled past this distance from the top of the page?"
 *
 * Implemented with a zero-cost sentinel and an IntersectionObserver rather than
 * a scroll listener — scroll handlers run on every frame of every scroll and
 * are the classic source of jank on phones. The sentinel is a 1px-wide,
 * absolutely positioned element that affects nothing.
 *
 * The consumer renders `sentinel` inside a positioned, document-flow ancestor
 * (SiteLayout does this) and reads `past`.
 */
export function useScrolledPast(height: string) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setPast(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
    height,
    pointerEvents: "none",
    visibility: "hidden",
  };

  return { past, sentinel: <span ref={ref} aria-hidden="true" style={style} /> };
}
