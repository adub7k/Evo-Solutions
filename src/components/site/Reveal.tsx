import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
}

/* ---- shared scroll fallback ----
 * One window listener + one batched check for every Reveal on the page,
 * instead of a listener per instance (50+ of them made scrolling stutter).
 * Runs alongside IntersectionObserver; whichever fires first wins. */
type Watcher = { el: HTMLElement; reveal: () => void };
const watchers = new Set<Watcher>();
let listening = false;
let scheduled = false;

function checkAll() {
  scheduled = false;
  const vh = window.innerHeight;
  watchers.forEach((w) => {
    if (w.el.getBoundingClientRect().top < vh * 0.96) w.reveal();
  });
}
function onScrollOrResize() {
  // setTimeout, not rAF: rAF stalls entirely in throttled renderers.
  if (!scheduled && watchers.size) {
    scheduled = true;
    setTimeout(checkAll, 60);
  }
}
function subscribe(w: Watcher) {
  watchers.add(w);
  if (!listening) {
    listening = true;
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("orientationchange", onScrollOrResize);
  }
  return () => watchers.delete(w);
}

/* Scroll-reveal that can never strand content: SSR/no-JS ships everything
 * visible; hiding happens only once JS runs, and reveal triggers from the
 * observer or the shared scroll fallback — whichever arrives first. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // above fold: stay visible

    setPhase("hidden");

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setPhase("shown");
      unsubscribe();
      io.disconnect();
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && reveal()),
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    const unsubscribe = subscribe({ el, reveal });

    return () => {
      unsubscribe();
      io.disconnect();
    };
  }, []);

  // Short stagger and a quick curve: reveal should trail the thumb by a
  // beat, not by a second — long fades read as lag on mobile.
  const cappedDelay = Math.min(delay, 180);
  return (
    <Tag
      ref={ref as never}
      style={
        phase === "idle"
          ? undefined
          : {
              opacity: phase === "shown" ? 1 : 0,
              transform: phase === "shown" ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${cappedDelay}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${cappedDelay}ms`,
            }
      }
      className={className}
    >
      {children}
    </Tag>
  );
}
