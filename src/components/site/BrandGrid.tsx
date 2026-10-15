import { Link } from "@tanstack/react-router";
import { brandCover, type Brand } from "@/lib/catalog";

export function BrandGrid({ brands }: { brands: Brand[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {brands.map((b, idx) => (
        <Link
          key={b.id}
          to="/brands/$slug"
          params={{ slug: b.slug }}
          className="group relative block overflow-hidden rounded-2xl bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={brandCover(b, idx)}
            alt={`${b.name} watches`}
            loading="lazy"
            width={800}
            height={1000}
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="font-display text-xl font-medium text-primary-foreground sm:text-2xl">{b.name}</h3>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-soft opacity-80 transition-opacity group-hover:opacity-100">
              View collection →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
