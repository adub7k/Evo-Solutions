import { useMemo } from "react";
import { useShopGallery } from "@/lib/shopGallery";
import { progression, beforeAfterPairs } from "@/content/gallery";
import { Photo } from "./Photo";
import { BeforeAfter } from "./BeforeAfter";
import { Reveal } from "./Reveal";

/**
 * Two ends of one real job on one real car — film going onto the door glass,
 * and the finished result.
 *
 * Deliberately NOT labelled "before and after". We don't have true
 * before/after pairs from Angelo yet, and staging one out of two unrelated
 * cars would be exactly the kind of thing this site is trying not to do.
 * When real pairs arrive (VERIFY.md), this section becomes the before/after.
 * Renders nothing at all if either photo is missing.
 */
export function Progression() {
  const { photos } = useShopGallery();

  // Real before/after pairs win when they exist — same car, same angle — and
  // get the comparison slider. Until then we show the honest progression.
  const sliders = useMemo(
    () =>
      beforeAfterPairs
        .map((p) => ({
          pair: p,
          before: photos.find((x) => x.url.includes(p.beforeMatch)),
          after: photos.find((x) => x.url.includes(p.afterMatch)),
        }))
        .filter((s) => s.before && s.after),
    [photos],
  );

  const pair = useMemo(() => {
    const before = photos.find((p) => p.url.includes(progression.beforeMatch));
    const after = photos.find((p) => p.url.includes(progression.afterMatch));
    return before && after ? { before, after } : null;
  }, [photos]);

  if (sliders.length) {
    return (
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {sliders.map(({ pair: p, before, after }) => (
          <Reveal key={p.id}>
            <BeforeAfter
              before={before!.url}
              after={after!.url}
              beforeAlt={before!.alt}
              afterAlt={after!.alt}
            />
            <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
            <p className="mt-1 leading-relaxed text-muted-foreground">{p.blurb}</p>
          </Reveal>
        ))}
      </div>
    );
  }

  if (!pair) return null;

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2">
      <Reveal>
        <Photo src={pair.before.url} alt={pair.before.alt} ratio="4/3" />
        <p className="mt-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="text-accent">01</span> {progression.beforeLabel}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <Photo src={pair.after.url} alt={pair.after.alt} ratio="4/3" />
        <p className="mt-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="text-accent">02</span> {progression.afterLabel}
        </p>
      </Reveal>
    </div>
  );
}
