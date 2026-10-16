import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Layout } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ProductRail } from "@/components/site/ProductRail";
import { BrandGrid } from "@/components/site/BrandGrid";
import { EmptyCollection } from "@/components/site/ProductCard";
import { CollectionLoop } from "@/components/site/CollectionLoop";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { brandsQuery, heroImages, productsQuery, settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JewelsByDelight | Premium Wristwatch Collection" },
      { name: "description", content: "Browse wristwatch photos from 14 brands at JewelsByDelight, Nigeria, and message us on WhatsApp to buy." },
      { property: "og:title", content: "JewelsByDelight | Premium Wristwatch Collection" },
      { property: "og:description", content: "Wristwatches for every style, occasion and moment. Enquire on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(brandsQuery()),
      queryClient.ensureQueryData(productsQuery()),
      queryClient.ensureQueryData(settingsQuery()),
    ]).then(() => null),
  component: Home,
});

const btn = "inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-transform hover:scale-[1.03]";

function Home() {
  const { data: brands } = useSuspenseQuery(brandsQuery());
  const { data: all } = useSuspenseQuery(productsQuery());

  return (
    <Layout overlay>
      <section className="relative flex min-h-[88vh] items-end">
        <HeroSlider
          images={heroImages.map((src, i) => ({ src, alt: ["Steel wristwatch with champagne dial on ivory linen", "Gold chronograph with brown leather strap", "Minimal cream-dial watch worn on the wrist"][i] ?? "Wristwatch" }))}
        />
        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-6 pb-28">
          <p className="fade-up text-xs font-semibold uppercase tracking-[0.35em] text-gold-soft">JewelsByDelight</p>
          <h1 className="fade-up mt-4 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.05] text-primary-foreground sm:text-7xl">
            Time. Elegance. Individuality.
          </h1>
          <p className="fade-up-delayed mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
            Discover a collection of wristwatches for every style, occasion, and moment.
          </p>
          <div className="fade-up-delayed pointer-events-auto mt-10 flex flex-wrap gap-3">
            <Link to="/collection" className={`${btn} bg-primary-foreground text-foreground`}>Explore the Collection</Link>
            <Link to="/brands" className={`${btn} border border-primary-foreground/70 text-primary-foreground hover:bg-primary-foreground/10`}>Shop by Brand</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">The Collection</p>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Timepieces worth discovering</h2>
        </div>
        {all.length ? (
          <CollectionLoop products={all} />
        ) : (
          <EmptyCollection />
        )}
      </section>

      {all.length > 0 && (
        <section className="bg-secondary py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-10 font-display text-4xl font-medium sm:text-5xl">Discover Your Next Timepiece</h2>
            <ProductRail products={all.slice(0, 16)} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-medium sm:text-5xl">Explore Watches by Brand</h2>
          <Link to="/brands" className="text-sm font-semibold uppercase tracking-[0.2em] text-primary hover:underline">All brands →</Link>
        </div>
        <BrandGrid brands={brands} />
      </section>

      <section className="bg-secondary px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-medium sm:text-5xl">Found a watch you love?</h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
          Tell us which timepiece caught your eye, and contact JewelsByDelight directly on WhatsApp for enquiries and ordering.
        </p>
        <div className="mt-10"><WhatsAppButton /></div>
      </section>
    </Layout>
  );
}
