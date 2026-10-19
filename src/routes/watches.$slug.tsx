import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Watch, X } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { AVAILABILITY, productMessage, productQuery, settingsQuery, watchPhotoLink, type Product } from "@/lib/catalog";
import { useSiteOrigin } from "@/lib/site-origin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watches/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    const [p] = await Promise.all([
      queryClient.ensureQueryData(productQuery(params.slug)),
      queryClient.ensureQueryData(settingsQuery()),
    ]);
    if (!p) throw notFound();
    return { name: p.name, brand: p.brand?.name ?? "", description: p.description };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.brand || loaderData.name} Watches | JewelsByDelight` : "Watch | JewelsByDelight";
    const d = loaderData?.description?.slice(0, 155) || (loaderData ? `${loaderData.brand || loaderData.name} watches at JewelsByDelight. Enquire on WhatsApp.` : "Watch details");
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: WatchPage,
  notFoundComponent: () => (
    <Layout>
      <div className="px-6 py-24 text-center">
        <p className="text-muted-foreground">This watch isn't available.</p>
        <Link to="/collection" className="mt-4 inline-block text-primary underline">Back to the collection</Link>
      </div>
    </Layout>
  ),
});

function Gallery({ product }: { product: Product }) {
  const imgs = product.images;
  const [i, setI] = useState(Math.max(0, imgs.findIndex((x) => x.is_primary)));
  const [zoom, setZoom] = useState(false);
  const touch = useRef<number | null>(null);
  if (!imgs.length)
    return <div className="flex aspect-square items-center justify-center rounded-2xl bg-secondary text-muted-foreground"><Watch className="h-12 w-12" /></div>;
  const go = (d: number) => setI((x) => (x + d + imgs.length) % imgs.length);
  const alt = (k: number) => imgs[k]!.alt_text || `${product.brand?.name} ${product.name} photo ${k + 1}`;
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl bg-secondary"
        onTouchStart={(e) => (touch.current = e.touches[0]!.clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0]!.clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <button onClick={() => setZoom(true)} className="block w-full" aria-label="Open larger image">
          <img src={imgs[i]!.url} alt={alt(i)} width={1000} height={1000} className="aspect-square w-full object-contain" />
        </button>
        {imgs.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
          {imgs.map((im, k) => (
            <button key={im.id} onClick={() => setI(k)} aria-label={`Show image ${k + 1}`} className={cn("shrink-0 overflow-hidden rounded-lg border-2", k === i ? "border-gold" : "border-transparent opacity-70")}>
              <img src={im.url} alt="" loading="lazy" width={80} height={80} className="h-20 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4" role="dialog" aria-modal onClick={() => setZoom(false)}>
          <button aria-label="Close" className="absolute right-4 top-4 text-primary-foreground"><X className="h-7 w-7" /></button>
          <img src={imgs[i]!.url} alt={alt(i)} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image" className="absolute left-4 text-primary-foreground"><ChevronLeft className="h-8 w-8" /></button>
              <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image" className="absolute right-4 text-primary-foreground"><ChevronRight className="h-8 w-8" /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function WatchPage() {
  const { slug } = Route.useParams();
  const origin = useSiteOrigin();
  const { data: p } = useSuspenseQuery(productQuery(slug));
  if (!p) return null;
  const specs = [
    ["Model / reference", p.model],
    ["Strap", p.strap_material],
    ["Dial colour", p.dial_colour],
    ["Case", p.case_material],
    ["Movement", p.movement_type],
    ["Water resistance", p.water_resistance],
  ].filter(([, v]) => v);
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <nav className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/collection" className="hover:text-foreground">Collection</Link>
          {p.brand && (
            <> / <Link to="/brands/$slug" params={{ slug: p.brand.slug }} className="hover:text-foreground">{p.brand.name}</Link></>
          )}{" "}
          / <span className="text-foreground">{p.name}</span>
        </nav>
        <div className="grid gap-12 lg:grid-cols-2">
          <Gallery product={p} />
          <div>
            <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">{p.brand?.name ?? p.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{AVAILABILITY[p.availability_status] ?? p.availability_status}</p>
            {p.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{p.description}</p>}
            {specs.length > 0 && (
              <dl className="mt-8 divide-y border-y">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8"><WhatsAppButton message={productMessage(p, watchPhotoLink(p.slug, origin))} label="Tap to Buy" className="max-w-full tracking-normal" /></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
