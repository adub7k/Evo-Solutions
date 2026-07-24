import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MapPin, Clock, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/config/site";
import { fetchSiteTeam, type TeamMember } from "@/lib/shopGallery";

const TITLE = "About Evo Solutions — Formerly MAD Detailing NM | Albuquerque";
const DESC =
  "Evo Solutions is the next chapter of MAD Detailing NM — the same Albuquerque crew behind a 5.0-star Google rating, now offering window tint, PPF, ceramic coating, and detailing.";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("MAD Detailing NM, 3500 Vista Alameda NE A, Albuquerque, NM 87113");

// Owner-curated staff roster from ShopFlow (Settings → Meet the Team). Renders
// nothing until real members exist — we never show placeholder/invented staff.
function MeetTheTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchSiteTeam().then(setTeam);
  }, []);

  if (team.length === 0) return null;

  return (
    <section className="pb-20">
      <div className="container-x max-w-5xl">
        <Reveal className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Meet the Team</div>
          <h2 className="mt-4 text-3xl sm:text-4xl text-balance">
            The people behind the work.
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <Reveal
              key={m.id}
              delay={i * 70}
              className="rounded-3xl hairline bg-card/60 p-6 text-center sm:text-left"
            >
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    loading="lazy"
                    className="h-20 w-20 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-accent text-2xl font-medium text-accent-foreground">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-lg font-medium text-foreground">{m.name}</div>
                  {m.title && <div className="text-sm text-accent">{m.title}</div>}
                </div>
              </div>
              {m.bio && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "https://www.evosolution.org/about" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SiteLayout>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="container-x max-w-3xl">
          <div className="text-xs uppercase tracking-[0.24em] text-accent">Our Story</div>
          <h1 className="mt-4 text-4xl sm:text-6xl text-balance leading-[1.05]">
            Same crew. Same standards. New name.
          </h1>
          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              You might know us as <span className="text-foreground">MAD Detailing NM</span>.
              For years we've been the shop on Vista Alameda that Albuquerque trusted with
              interiors, corrections, and coatings — and earned a
              <span className="text-foreground"> 5.0-star Google rating</span> doing it.
            </p>
            <p>
              As the work grew beyond detailing — window tint, paint protection film, ceramic
              coatings — the name needed to grow with it.
              <span className="text-foreground"> Evo Solutions</span> is that next chapter:
              the same people and the same obsession with getting details right, now covering
              everything that protects and improves your vehicle.
            </p>
            <p>
              Nothing about how we work changed. Flat quotes before we start. Films and
              products we'd put on our own cars. And if something's not right, we make it
              right — that's how the rating got to 5.0 and how it stays there.
            </p>
          </div>
        </div>
      </section>

      <MeetTheTeam />

      <section className="pb-20">
        <div className="container-x grid gap-6 max-w-3xl sm:grid-cols-3">
          <Reveal className="rounded-3xl hairline bg-card/60 p-6">
            <MapPin className="h-5 w-5 text-accent" />
            <div className="mt-3 text-sm font-medium">Find us</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{site.business.address}</p>
            <a href={MAPS_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              Directions <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
          <Reveal delay={60} className="rounded-3xl hairline bg-card/60 p-6">
            <Clock className="h-5 w-5 text-accent" />
            <div className="mt-3 text-sm font-medium">Hours</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {site.business.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3">
                  <span>{h.day}</span>
                  <span>{h.value}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-3xl hairline bg-card/60 p-6">
            <Star className="h-5 w-5 text-accent" />
            <div className="mt-3 text-sm font-medium">5.0 on Google</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every review five stars. Read them, then come see why.
            </p>
            <a href="/#reviews" className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              Read reviews <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
