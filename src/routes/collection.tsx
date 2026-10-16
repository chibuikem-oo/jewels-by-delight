import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Layout, PageIntro } from "@/components/site/Layout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { productsQuery, settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The Collection | JewelsByDelight" },
      { name: "description", content: "Browse available wristwatch photos at JewelsByDelight. Find a watch by brand or model and message us on WhatsApp to buy." },
      { property: "og:title", content: "The Collection | JewelsByDelight" },
      { property: "og:description", content: "Find the timepiece that fits your style." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(productsQuery()), queryClient.ensureQueryData(settingsQuery())]).then(() => null),
  component: CollectionPage,
  errorComponent: () => <Layout><p className="px-6 py-24 text-center">The collection couldn't load. Please refresh.</p></Layout>,
});

function CollectionPage() {
  const { data } = useSuspenseQuery(productsQuery());
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <PageIntro eyebrow="The Collection" title="Find the timepiece that fits your style.">
          Browse the watches available at JewelsByDelight, explore different brands, and find your next favourite timepiece.
        </PageIntro>
        <CatalogBrowser products={data} />
      </section>
    </Layout>
  );
}
