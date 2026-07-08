import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
}

/* Scroll-reveal that fails open: SSR ships the content fully visible, and we
 * only hide-then-animate on clients where JS actually ran. If the bundle
 * never loads (slow phone, flaky connection), the page still reads top to
 * bottom instead of stranding everything below the fold at opacity 0. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // "idle" (SSR + no-JS: visible, unstyled) → "hidden" → "shown" (animated)
  const [phase, setPhase] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at hydration (above the fold): leave it visible —
    // hiding it now would flash content the visitor is already reading.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setPhase("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPhase("shown");
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
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
