import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import storyImage from "@/assets/watch-5.jpg";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story | JewelsByDelight" },
      { name: "description", content: "JewelsByDelight brings together wristwatches from a diverse range of brands to help you find a timepiece that reflects your style." },
      { property: "og:title", content: "Our Story | JewelsByDelight" },
      { property: "og:description", content: "A passion for time and style." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <Layout>
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-2xl">
            <img src={storyImage} alt="Rose gold watch with tan leather strap" width={800} height={1008} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Our Story</p>
            <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">A Passion for Time and Style</h1>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              At JewelsByDelight, we bring together wristwatches from a diverse range of brands to help you find a timepiece that reflects your personal style.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From everyday designs to distinctive statement watches, our collection is designed to make exploring different styles and brands simple and enjoyable.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Browse our collection, discover your preferred brand, and contact us directly for enquiries about available watches.
            </p>
            <Link to="/collection" className="mt-10 inline-flex rounded-full bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:scale-[1.03]">
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
