import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section, SectionHead } from "@/components/site/Section";
import { Photo } from "@/components/site/Photo";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { Reviews, ReviewsCta } from "@/components/site/Reviews";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/Reveal";

import { site } from "@/config/site";
import { images, bundledFor } from "@/config/images";
import { whyEvo } from "@/content/home";
import { useSiteImage, useSiteTeam } from "@/lib/shopGallery";
import { seo, breadcrumbLd } from "@/lib/seo";

const PATH = "/about";
const TITLE = "About Evo Solutions — Albuquerque Tint & Paint Protection Shop";
const DESC =
  "Evo Solutions is an owner-run tint, PPF, coating and detailing shop on Vista Alameda in Albuquerque. Formerly MAD Detailing NM. Meet the crew.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "About", path: PATH },
];

export const Route = createFileRoute("/about")({
  head: () => {
    const meta = seo({ title: TITLE, description: DESC, path: PATH });
    return {
      ...meta,
      scripts: [{ type: "application/ld+json", children: breadcrumbLd(CRUMBS) }],
    };
  },
  component: About,
});

function About() {
  const team = useSiteTeam();
  const shopPhoto = useSiteImage("service_detail", images.service.service_detail.webp);
  const bundledShop = bundledFor("service_detail", shopPhoto);

  return (
    <SiteLayout>
      <section className="pt-[4.5rem]">
        <div className="container-x pb-12 pt-8 sm:pt-12">
          <Breadcrumbs trail={CRUMBS} />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div className="animate-rise">
              <p className="eyebrow">About the shop</p>
              <h1 className="mt-4">A small shop on Vista Alameda that takes this seriously.</h1>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Evo Solutions is owner-run. Angelo is in the building, and the people whose faces
                  are on this page are the people who'll be working on your car — not a rotating
                  crew and not a subcontractor.
                </p>
                <p>
                  We do window tint, paint protection film, ceramic coating and detailing, plus flat
                  glass for offices, storefronts and homes across the metro.
                </p>
              </div>
            </div>

            <Photo src={shopPhoto} alt={images.service.service_detail.alt} ratio="4/3" priority />
          </div>
        </div>
      </section>

      {/* The rename, stated plainly. Hiding it would look worse than owning it. */}
      <Section tone="raised" tight>
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <SectionHead
              eyebrow="The name change"
              title={`We used to be ${site.business.formerName}.`}
            />
            <Reveal
              delay={60}
              className="space-y-4 text-[1.0625rem] leading-relaxed text-muted-foreground"
            >
              <p>
                The shop started out as {site.business.formerName} and built its reputation on
                detail work. As the film side grew — tint, then paint protection, then commercial
                glass — the old name stopped describing what we actually do all day.
              </p>
              <p>
                So the sign changed. Nothing else did. Same owner, same crew, same address, and the
                same Google profile — which is why some of the reviews on this site talk about
                detailing rather than film.
              </p>
              <p className="text-foreground">
                If you had work done here under the old name, you're still dealing with us.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Real team, straight from ShopFlow. Renders nothing if unset — we
          don't invent staff. */}
      {team.length > 0 && (
        <Section>
          <div className="container-x">
            <SectionHead eyebrow="The crew" title="Who'll actually be working on it." />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m, i) => (
                <Reveal key={m.id} delay={i * 60}>
                  {m.photo && (
                    <Photo
                      src={m.photo}
                      alt={`${m.name}, ${m.title} at Evo Solutions`}
                      ratio="4/3"
                    />
                  )}
                  <h3 className="mt-4 font-display text-xl font-semibold">{m.name}</h3>
                  {m.title && <p className="mt-0.5 text-sm text-accent">{m.title}</p>}
                  {m.bio && <p className="mt-2 leading-relaxed text-muted-foreground">{m.bio}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section tone="raised">
        <div className="container-x">
          <SectionHead eyebrow="How we work" title="What you can expect from us." />
          <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {whyEvo.map((w, i) => (
              <Reveal key={w.title} delay={i * 40}>
                <div className="h-px w-10 bg-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{w.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="cv-auto">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="In the shop"
              title="What a week here looks like."
              className="max-w-xl"
            />
            <Link to="/gallery" className="btn btn-ghost shrink-0">
              See all our work
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <GalleryGrid limit={6} showFilters={false} />
        </div>
      </Section>

      <Section tone="raised" className="cv-auto">
        <div className="container-x">
          <SectionHead
            eyebrow={`${site.reviews.rating.toFixed(1)} on Google`}
            title="What people say about us."
            align="center"
          />
          <Reviews />
          <div className="mt-8 text-center">
            <ReviewsCta />
          </div>
        </div>
      </Section>

      <FinalCTA
        heading="Come and see the place."
        body="Walk-ins are welcome Mon–Sat. Or send us the details and we'll get you a price first."
        location="about-final"
      />
    </SiteLayout>
  );
}
