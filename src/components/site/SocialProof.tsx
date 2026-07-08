import { site } from "@/config/site";

export function SocialProof() {
  return (
    <section className="border-y border-border/60 bg-surface/40 py-14">
      <div className="container-x">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {site.stats.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <div className="font-display text-4xl sm:text-5xl ember-text">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-hidden">
          <div className="text-center text-xs uppercase tracking-[0.24em] text-muted-foreground mb-6">
            Trusted Premium Film Partners
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
            {/* Exactly 2 copies: the -50% translate loop is seamless only when
                the track is two identical halves. */}
            <div className="flex gap-16 pr-16 animate-marquee whitespace-nowrap">
              {[...site.filmBrands, ...site.filmBrands].map((b, i) => (
                <span
                  key={i}
                  className="font-display text-2xl sm:text-3xl text-muted-foreground/60 tracking-widest"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
