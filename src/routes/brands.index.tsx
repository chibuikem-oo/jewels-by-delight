import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Layout, PageIntro } from "@/components/site/Layout";
import { BrandGrid } from "@/components/site/BrandGrid";
import { brandsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/brands/")({
  head: () => ({
    meta: [
      { title: "Watch Brands | JewelsByDelight" },
      { name: "description", content: "Explore wristwatches by brand at JewelsByDelight — from Audemars Piguet to Tommy Hilfiger." },
      { property: "og:title", content: "Watch Brands | JewelsByDelight" },
      { property: "og:description", content: "Explore wristwatches by brand at JewelsByDelight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(brandsQuery()).then(() => null),
  component: BrandsPage,
});

function BrandsPage() {
  const { data } = useSuspenseQuery(brandsQuery());
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <PageIntro eyebrow="Brands" title="Explore Watches by Brand">
          Choose a brand to see the watches currently available in that collection.
        </PageIntro>
        <BrandGrid brands={data} />
      </section>
    </Layout>
  );
}
