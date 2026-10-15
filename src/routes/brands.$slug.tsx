import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Layout } from "@/components/site/Layout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { brandCover, brandsQuery, fetchProducts, settingsQuery } from "@/lib/catalog";

const brandProductsQuery = (brandId: string) =>
  queryOptions({ queryKey: ["products", "brand", brandId], queryFn: () => fetchProducts({ brandId }) });

export const Route = createFileRoute("/brands/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    const brands = await queryClient.ensureQueryData(brandsQuery());
    const idx = brands.findIndex((b) => b.slug === params.slug);
    if (idx < 0) throw notFound();
    await Promise.all([
      queryClient.ensureQueryData(brandProductsQuery(brands[idx]!.id)),
      queryClient.ensureQueryData(settingsQuery()),
    ]);
    return { name: brands[idx]!.name };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} Watches | JewelsByDelight` : "Brand | JewelsByDelight";
    const d = loaderData ? `Browse ${loaderData.name} wristwatches available at JewelsByDelight and enquire on WhatsApp.` : "Brand collection";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BrandPage,
  notFoundComponent: () => (
    <Layout>
      <div className="px-6 py-24 text-center">
        <p className="text-muted-foreground">We couldn't find that brand.</p>
        <Link to="/brands" className="mt-4 inline-block text-primary underline">See all brands</Link>
      </div>
    </Layout>
  ),
});

function BrandPage() {
  const { slug } = Route.useParams();
  const { data: brands } = useSuspenseQuery(brandsQuery());
  const idx = brands.findIndex((b) => b.slug === slug);
  const brand = brands[idx]!;
  const { data: products } = useSuspenseQuery(brandProductsQuery(brand.id));
  return (
    <Layout>
      <section className="relative overflow-hidden">
        <img src={brandCover(brand, idx)} alt={`${brand.name} watches`} width={1600} height={600} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <nav className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
            <Link to="/brands" className="hover:text-primary-foreground">Brands</Link> / {brand.name}
          </nav>
          <h1 className="mt-4 font-display text-5xl font-medium text-primary-foreground sm:text-6xl">{brand.name}</h1>
          {brand.description && <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/85">{brand.description}</p>}
          <div className="mt-8">
            <WhatsAppButton message={`Hello JewelsByDelight, I'm interested in ${brand.name} watches. What do you have available?`} label={`Ask about ${brand.name}`} />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <CatalogBrowser products={products} showBrandFilter={false} />
      </section>
    </Layout>
  );
}
