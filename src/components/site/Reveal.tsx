import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
}

/* Scroll-reveal that can never strand content:
 * - SSR/no-JS ships everything fully visible ("idle").
 * - Content is hidden for the animation only once JS is running, and only
 *   for elements below the fold at that moment.
 * - Reveal triggers via IntersectionObserver AND a plain scroll/resize
 *   fallback (covers throttled observers and phone rotation), so a visible
 *   position always wins no matter which signal arrives. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const inView = () => el.getBoundingClientRect().top < window.innerHeight * 0.92;
    // Above the fold at hydration: leave it visible, no animation.
    if (inView()) return;

    setPhase("hidden");

    let done = false;
    let ticking = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setPhase("shown");
      cleanup();
    };
    const check = () => {
      ticking = false;
      if (inView()) reveal();
    };
    const onScrollOrResize = () => {
      if (!ticking && !done) {
        ticking = true;
        // setTimeout, not requestAnimationFrame: rAF stalls entirely in
        // throttled/background renderers, which is one of the failure modes
        // this fallback exists to cover.
        setTimeout(check, 80);
      }
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && reveal()),
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("orientationchange", onScrollOrResize);

    function cleanup() {
      io.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("orientationchange", onScrollOrResize);
    }
    return cleanup;
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={
        phase === "idle"
          ? undefined
          : {
              opacity: phase === "shown" ? 1 : 0,
              transform: phase === "shown" ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
            }
      }
      className={className}
    >
      {children}
    </Tag>
  );
}
