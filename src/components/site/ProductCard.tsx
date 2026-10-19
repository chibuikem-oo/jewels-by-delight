import { Link } from "@tanstack/react-router";
import { Watch } from "lucide-react";
import { primaryImage, productMessage, type Product } from "@/lib/catalog";
import { WhatsAppButton } from "./WhatsAppButton";

export function ProductCard({ product }: { product: Product }) {
  const img = primaryImage(product);
  return (
    <article className="group flex flex-col">
      <Link to="/watches/$slug" params={{ slug: product.slug }} className="block overflow-hidden rounded-2xl bg-secondary">
        {img ? (
          <img
            src={img.url}
            alt={img.alt_text || `${product.brand?.name ?? ""} ${product.name}`}
            loading="lazy"
            width={800}
            height={1000}
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-muted-foreground">
            <Watch className="h-10 w-10" />
          </div>
        )}
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{product.brand?.name}</p>
        {product.name.trim().toLowerCase() !== (product.brand?.name ?? "").toLowerCase() && <h3 className="mt-1 font-display text-2xl font-medium leading-tight">{product.name}</h3>}
        {product.model && <p className="text-sm text-muted-foreground">{product.model}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/watches/$slug"
            params={{ slug: product.slug }}
            className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            View details
          </Link>
          <WhatsAppButton message={productMessage(product)} label="Tap to Buy" className="w-full px-3 py-2.5 tracking-normal" />
        </div>
      </div>
    </article>
  );
}

export function EmptyCollection() {
  return (
    <div className="rounded-2xl border border-dashed bg-secondary/50 px-6 py-16 text-center">
      <Watch className="mx-auto h-8 w-8 text-gold" />
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        We're updating this collection. Please check back soon or contact us for enquiries.
      </p>
    </div>
  );
}
