/**
 * Section primitives. Every section on the site is built from these so the
 * rhythm, eyebrow style and heading sizes stay identical page to page —
 * the fix for "every section looks like a different component".
 */
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  id,
  children,
  className = "",
  tone = "base",
  tight = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** `raised` is one step lighter — used to separate adjacent sections. */
  tone?: "base" | "raised";
  tight?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${tight ? "section-y-tight" : "section-y"} ${
        tone === "raised" ? "bg-surface/40" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  body,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className={eyebrow ? "mt-3" : ""}>{title}</h2>
      {body && (
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">{body}</p>
      )}
    </Reveal>
  );
}

/** A thin brand rule used to open a section without a heavy divider. */
export function Rule({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-border ${className}`} />;
}
