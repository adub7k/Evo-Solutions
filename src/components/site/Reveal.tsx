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

type Entry = { el: HTMLElement; reveal: () => void };

let observer: IntersectionObserver | null = null;
const registry = new WeakMap<Element, Entry>();

/* ---- fail-open safety net -------------------------------------------------
 * This site has form: it once shipped a build that rendered black on iOS
 * because a throttled renderer stalled the reveal path. An observer that never
 * delivers must never mean permanently invisible content, so alongside the
 * IntersectionObserver there is ONE shared passive scroll/resize listener and
 * a hard timeout. Whichever fires first wins; the listener is thrown away as
 * soon as the last element has revealed.
 *
 * setTimeout, not requestAnimationFrame — rAF is exactly what stalls in a
 * throttled renderer, which is the case this exists to survive. */
const pending = new Set<Entry>();
let listening = false;
let queued = false;

function sweep() {
  queued = false;
  const vh = window.innerHeight;
  for (const entry of [...pending]) {
    if (entry.el.getBoundingClientRect().top < vh * 0.96) entry.reveal();
  }
  if (!pending.size) stopListening();
}

function onScrollOrResize() {
  if (queued || !pending.size) return;
  queued = true;
  setTimeout(sweep, 60);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
  window.addEventListener("orientationchange", onScrollOrResize, { passive: true });
  // Last resort: if nothing has fired at all, show everything. A visitor
  // seeing un-animated content is fine; a blank page is not.
  setTimeout(() => pending.forEach((e) => e.reveal()), 2500);
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", onScrollOrResize);
  window.removeEventListener("resize", onScrollOrResize);
  window.removeEventListener("orientationchange", onScrollOrResize);
}

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
    // No observer at all (very old browser): leave the content visible.
    if (!io) return;

    setHidden(true);
    let done = false;
    const entry: Entry = {
      el,
      reveal: () => {
        if (done) return;
        done = true;
        pending.delete(entry);
        setHidden(false);
      },
    };
    registry.set(el, entry);
    pending.add(entry);
    io.observe(el);
    startListening();

    return () => {
      io.unobserve(el);
      registry.delete(el);
      pending.delete(entry);
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
