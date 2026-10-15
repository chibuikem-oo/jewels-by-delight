import { createFileRoute } from "@tanstack/react-router";

import heroImage from "@/assets/hero.jpg";
import necklaceImage from "@/assets/necklace.jpg";
import earringsImage from "@/assets/earrings.jpg";
import ringImage from "@/assets/ring.jpg";
import braceletImage from "@/assets/bracelet.jpg";
import pearlSetImage from "@/assets/pearl-set.jpg";
import bangleImage from "@/assets/bangle.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JewelsByDelight — Handcrafted Gold & Pearl Jewelry" },
      {
        name: "description",
        content:
          "JewelsByDelight is a small atelier crafting delicate gold and pearl jewelry — necklaces, earrings, rings and bracelets made to be treasured every day.",
      },
      { property: "og:title", content: "JewelsByDelight — Handcrafted Gold & Pearl Jewelry" },
      {
        property: "og:description",
        content:
          "Delicate gold and pearl jewelry, handcrafted in small batches. Explore the collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pieces = [
  {
    name: "The Delight Pendant",
    category: "Necklace",
    description: "A luminous freshwater pearl cradled in hand-forged gold.",
    image: necklaceImage,
  },
  {
    name: "Lumière Hoops",
    category: "Earrings",
    description: "Pavé-set stones tracing a slender golden arc.",
    image: earringsImage,
  },
  {
    name: "Entwined Ring",
    category: "Ring",
    description: "Three bands of gold, flowing as one around a single stone.",
    image: ringImage,
  },
  {
    name: "Starlight Bracelet",
    category: "Bracelet",
    description: "Tiny charms and pearls scattered along a fine chain.",
    image: braceletImage,
  },
  {
    name: "Pearl Duet",
    category: "Set",
    description: "A matching pearl drop earring and ring, made to be worn together.",
    image: pearlSetImage,
  },
  {
    name: "Heritage Bangle",
    category: "Bangle",
    description: "Hand-engraved with a pattern passed down through generations.",
    image: bangleImage,
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="font-display text-2xl font-semibold tracking-wide text-primary-foreground drop-shadow-sm">
            JewelsByDelight
          </span>
          <div className="hidden items-center gap-8 text-sm font-medium tracking-wide text-primary-foreground/90 sm:flex">
            <a href="#collection" className="transition-opacity hover:opacity-70">
              Collection
            </a>
            <a href="#story" className="transition-opacity hover:opacity-70">
              Our Story
            </a>
            <a href="#contact" className="transition-opacity hover:opacity-70">
              Contact
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-end overflow-hidden">
        <img
          src={heroImage}
          alt="Gold and pearl jewelry arranged on warm linen"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-foreground/30" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
          <p className="fade-up text-sm font-semibold uppercase tracking-[0.3em] text-gold-soft">
            Handcrafted in small batches
          </p>
          <h1 className="fade-up mt-4 max-w-2xl text-balance font-display text-5xl font-medium leading-[1.05] text-primary-foreground sm:text-7xl">
            Jewelry made to be treasured
          </h1>
          <p className="fade-up-delayed mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
            Delicate gold and pearl pieces, shaped by hand and finished with care — for the moments,
            big and small, worth remembering.
          </p>
          <a
            href="#collection"
            className="fade-up-delayed mt-10 inline-flex items-center justify-center rounded-full bg-primary-foreground px-8 py-3 text-sm font-semibold tracking-wide text-foreground transition-transform hover:scale-[1.03]"
          >
            Explore the Collection
          </a>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            The Collection
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
            Pieces we love right now
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Each piece is made to order in our atelier. If something catches your eye, reach out —
            we would love to make it yours.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((piece) => (
            <article key={piece.name} className="group">
              <div className="overflow-hidden rounded-2xl bg-secondary">
                <img
                  src={piece.image}
                  alt={piece.name}
                  loading="lazy"
                  width={800}
                  height={1008}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  {piece.category}
                </p>
                <h3 className="mt-1 font-display text-2xl font-medium">{piece.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {piece.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={pearlSetImage}
              alt="Pearl earring and ring from the JewelsByDelight atelier"
              loading="lazy"
              width={800}
              height={1008}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Our Story
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
              A little atelier, a lot of heart
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              JewelsByDelight began at a kitchen table with a spool of gold wire and a handful of
              pearls. Today, every piece is still shaped, polished and finished by hand — slowly,
              deliberately, and always with the person who will wear it in mind.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We work in small batches using responsibly sourced gold and freshwater pearls, so no
              two pieces are ever exactly alike. That is exactly how we like it.
            </p>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Get in Touch
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-balance font-display text-4xl font-medium sm:text-5xl">
          Found something you love?
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
          Every piece is made to order. Send us a note and we will craft it just for you.
        </p>
        <a
          href="mailto:hello@jewelsbydelight.com"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold tracking-wide text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          hello@jewelsbydelight.com
        </a>
        <p className="mt-20 text-xs tracking-wide text-muted-foreground">
          © {new Date().getFullYear()} JewelsByDelight. Handcrafted with love.
        </p>
      </footer>
    </div>
  );
}
