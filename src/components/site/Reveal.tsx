import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll reveal.
 *
 * Rules this follows, in order of importance:
 *
 *  1. **It can never strand content.** Server HTML ships everything visible.
 *     Hiding only happens once JS has run and only for elements below the
 *     fold, so no-JS, a failed hydration or a dead observer all leave a fully
 *     readable page.
 *  2. **One observer, not one per element.** A single shared
 *     IntersectionObserver handles every Reveal on the page — no scroll
 *     listeners anywhere.
 *  3. **Only transform and opacity.** Both are compositor-friendly, so a
 *     reveal never triggers layout or paint.
 *  4. **Subtle.** 15px of travel over ~500ms, stagger capped at 180ms. It
 *     should read as the page settling, not as an animation.
 */

type RevealProps = {
  children: ReactNode;
  /** Stagger within a group, in ms. Capped — long chains read as lag. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
};

type Entry = { reveal: () => void };

let observer: IntersectionObserver | null = null;
const registry = new WeakMap<Element, Entry>();

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          registry.get(e.target)?.reveal();
          observer?.unobserve(e.target);
          registry.delete(e.target);
        }
      },
      // Fire a little before the element reaches the viewport so the motion
      // has finished by the time it's properly in view.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
  }
  return observer;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // Already on screen at mount (hero, first section) — leave it alone rather
    // than hiding then re-showing, which reads as a flash.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    const io = getObserver();
    if (!io) return;

    setHidden(true);
    let done = false;
    const entry: Entry = {
      reveal: () => {
        if (done) return;
        done = true;
        setHidden(false);
      },
    };
    registry.set(el, entry);
    io.observe(el);

    return () => {
      io.unobserve(el);
      registry.delete(el);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal={hidden ? "hidden" : "shown"}
      style={hidden ? { transitionDelay: "0ms" } : { transitionDelay: `${Math.min(delay, 180)}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
