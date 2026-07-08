import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { SocialProof } from "@/components/site/SocialProof";
import { WhyTint } from "@/components/site/WhyTint";
import { Services } from "@/components/site/Services";
import { ShadePicker } from "@/components/site/ShadePicker";
import { Gallery } from "@/components/site/Gallery";
import { Packages } from "@/components/site/Packages";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Process } from "@/components/site/Process";
import { Testimonials } from "@/components/site/Testimonials";
import { EstimateForm } from "@/components/site/EstimateForm";
import { FAQ } from "@/components/site/FAQ";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Footer } from "@/components/site/Footer";
import { site } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.business.name} — Premium Window Tint & Auto Protection` },
      {
        name: "description",
        content:
          "Premium ceramic window tint, PPF, and ceramic coating installed by certified specialists. Lifetime warranty. Get your free quote today.",
      },
      { property: "og:title", content: `${site.business.name} — Premium Window Tint` },
      {
        property: "og:description",
        content:
          "Professional window tint, PPF, and ceramic coating with lifetime warranty.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <WhyTint />
        <Services />
        <ShadePicker />
        <Gallery />
        <Packages />
        <WhyChooseUs />
        <Process />
        <Testimonials />
        <EstimateForm />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
