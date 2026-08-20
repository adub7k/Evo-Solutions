import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { MobileCTA } from "./MobileCTA";
import { useScrolledPast } from "@/lib/useScrolledPast";

/**
 * Shared chrome for every page.
 *
 * The two sentinels live here because they need a positioned ancestor that's
 * in normal document flow — a fixed header would anchor them to itself. Nav
 * and MobileCTA then read plain booleans instead of each attaching their own
 * scroll listener.
 *
 * The bottom padding on <main> reserves room for the sticky mobile CTA so it
 * can never sit on top of page content.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  // Header goes compact almost immediately.
  const { past: scrolled, sentinel: topSentinel } = useScrolledPast("8px");
  // Sticky CTA appears once the first screen — and the hero's own buttons —
  // are behind the visitor.
  const { past: pastFold, sentinel: foldSentinel } = useScrolledPast("78vh");

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {topSentinel}
      {foldSentinel}
      <Nav scrolled={scrolled} />
      <main id="main" className="pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileCTA visible={pastFold} />
    </div>
  );
}
