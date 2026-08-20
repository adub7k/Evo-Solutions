import type { CSSProperties } from "react";

/**
 * The one image wrapper the site uses.
 *
 * Two jobs beyond rendering an <img>:
 *
 *  1. **No layout shift.** The frame always reserves its box via aspect-ratio
 *     before the file arrives, so text and buttons never move as photos load.
 *  2. **Right format.** Bundled photos ship as AVIF with a WebP fallback via
 *     <picture>. Owner uploads from ShopFlow are JPEG and render directly.
 *
 * The shop's photos are mostly phone shots — portrait, square and 16:9 in the
 * same grid — so the frame pins a ratio and covers.
 */
type Props = {
  src: string;
  alt: string;
  /** AVIF source for bundled images. Omit for runtime/owner images. */
  avif?: string;
  avifSrcSet?: string;
  webpSrcSet?: string;
  sizes?: string;
  /** CSS aspect-ratio, e.g. "4/3", "1/1", "3/4". */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  /** The LCP image on a page. Everything else stays lazy. */
  priority?: boolean;
  width?: number;
  height?: number;
  style?: CSSProperties;
  scrim?: "none" | "bottom" | "full";
};

export function Photo({
  src,
  alt,
  avif,
  avifSrcSet,
  webpSrcSet,
  sizes,
  ratio = "4/3",
  className = "",
  imgClassName = "",
  priority = false,
  width,
  height,
  style,
  scrim = "none",
}: Props) {
  const img = (
    <img
      src={src}
      srcSet={webpSrcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={`h-full w-full object-cover ${imgClassName}`}
    />
  );

  return (
    <div className={`framed ${className}`} style={{ aspectRatio: ratio, ...style }}>
      {avif || avifSrcSet ? (
        <picture>
          <source type="image/avif" srcSet={avifSrcSet ?? avif} sizes={sizes} />
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
          {img}
        </picture>
      ) : (
        img
      )}
      {scrim === "bottom" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      )}
      {scrim === "full" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
      )}
      <div className="framed-rule" />
    </div>
  );
}
