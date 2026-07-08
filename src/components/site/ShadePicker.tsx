import { useState } from "react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

/* Interactive VLT preview: a sunset scene behind "glass" whose darkness maps
 * to the selected film's visible light transmission. Pure CSS/SVG — no assets. */

export function ShadePicker() {
  const defaultShade = site.shades.find((s) => s.vlt === 35) ?? site.shades[0];
  const [shade, setShade] = useState(defaultShade);
  // 5% VLT should read almost black but never fully void; ease the curve so
  // the visual difference between 70→50→35 is as legible as 20→5.
  const glassOpacity = Math.min(0.96, 1 - Math.pow(shade.vlt / 100, 0.72));

  return (
    <section id="shades" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.24em] text-accent">Shade Guide</div>
            <h2 className="mt-4 text-4xl sm:text-5xl text-balance">
              Find your shade before you even walk in.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              VLT — visible light transmission — is how much light passes through the
              film. Lower number, darker window. Preview the look, then we'll confirm
              what's legal for each window in your state during your quote.
            </p>

            <div className="mt-8 flex flex-wrap gap-2" role="radiogroup" aria-label="Tint shade">
              {site.shades.map((s) => {
                const active = s.vlt === shade.vlt;
                return (
                  <button
                    key={s.vlt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setShade(s)}
                    className={`rounded-full px-4 py-2.5 text-sm transition-all ${
                      active
                        ? "bg-accent text-accent-foreground shadow-glow"
                        : "hairline text-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl hairline bg-card/60 p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl ember-text">{shade.label}</span>
                <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  {shade.name}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{shade.body}</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative overflow-hidden rounded-3xl hairline shadow-elevated">
              {/* Sunset scene "outside the glass" */}
              <div
                className="relative aspect-[16/10]"
                style={{
                  background:
                    "linear-gradient(to bottom, oklch(0.45 0.09 265) 0%, oklch(0.6 0.13 45) 45%, oklch(0.75 0.15 60) 62%, oklch(0.35 0.05 60) 63%, oklch(0.22 0.02 60) 100%)",
                }}
              >
                {/* sun */}
                <div
                  className="absolute left-[62%] top-[38%] h-16 w-16 rounded-full"
                  style={{
                    background: "oklch(0.9 0.12 75)",
                    boxShadow: "0 0 60px 20px oklch(0.85 0.14 70 / 0.55)",
                  }}
                />
                {/* skyline silhouette */}
                <svg
                  viewBox="0 0 640 400"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                  preserveAspectRatio="xMidYMax slice"
                >
                  <path
                    d="M0 400V290h40v-50h30v50h25v-90h45v90h20v-40h35v40h30V210h55v190h25v-60h40v60h30v-110h50v110h25v-45h40v45h28v-75h42v75h20v-30h35v430H0z"
                    fill="oklch(0.17 0.015 60)"
                  />
                </svg>
                {/* the tint layer */}
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ backgroundColor: "oklch(0.08 0.005 60)", opacity: glassOpacity }}
                />
                {/* glass reflection streak */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 42%, oklch(1 0 0 / 0.07) 47%, oklch(1 0 0 / 0.02) 52%, transparent 58%)",
                  }}
                />
                {/* VLT readout */}
                <div className="absolute bottom-4 left-4 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em]">
                  {shade.label} VLT · {shade.name}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/80">
              On-screen preview is approximate — see real film samples on your own glass at the shop.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
