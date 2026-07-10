import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePage } from "@/components/site/ServicePage";
import { serviceBySlug } from "@/content/services";

const service = serviceBySlug("window-tint")!;

export const Route = createFileRoute("/window-tint")({
  head: () => ({
    meta: [
      { title: service.metaTitle },
      { name: "description", content: service.metaDescription },
      { property: "og:title", content: service.metaTitle },
      { property: "og:description", content: service.metaDescription },
    ],
    links: [{ rel: "canonical", href: `https://www.evosolution.org/${service.slug}` }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SiteLayout>
      <ServicePage service={service} />
    </SiteLayout>
  );
}
