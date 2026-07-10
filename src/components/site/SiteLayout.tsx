import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

// Shared chrome for every page — keeps the dark theme wrapper, nav and
// footer identical across the site.
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
