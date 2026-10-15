import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AVAILABILITY, sortBrands, type Product } from "@/lib/catalog";
import { EmptyCollection, ProductCard } from "./ProductCard";

const PAGE = 24;

export function CatalogBrowser({ products, showBrandFilter = true }: { products: Product[]; showBrandFilter?: boolean }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [avail, setAvail] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(PAGE);

  const brands = useMemo(() => {
    const m = new Map<string, { id: string; name: string }>();
    products.forEach((p) => p.brand && m.set(p.brand.id, p.brand));
    return sortBrands([...m.values()]);
  }, [products]);
  const hasPrices = products.some((p) => p.price != null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (term && ![p.name, p.model, p.brand?.name].some((v) => v?.toLowerCase().includes(term))) return false;
      if (brand && p.brand_id !== brand) return false;
      if (avail && p.availability_status !== avail) return false;
      if (min && (p.price == null || p.price < Number(min))) return false;
      if (max && (p.price == null || p.price > Number(max))) return false;
      return true;
    });
    const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    if (sort === "name") list = [...list].sort(byName);
    if (sort === "price-asc" || sort === "price-desc") {
      const dir = sort === "price-asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return (a.price - b.price) * dir;
      });
    }
    return list;
  }, [products, q, brand, avail, min, max, sort]);

  const active = q || brand || avail || min || max || sort !== "newest";
  const clear = () => {
    setQ(""); setBrand(""); setAvail(""); setMin(""); setMax(""); setSort("newest");
  };
  const field = "h-11 rounded-full border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  if (!products.length) return <EmptyCollection />;

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search watches</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, model or name" className={`${field} w-full pl-10`} />
        </label>
        {showBrandFilter && (
          <select aria-label="Filter by brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={field}>
            <option value="">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select aria-label="Filter by availability" value={avail} onChange={(e) => setAvail(e.target.value)} className={field}>
          <option value="">Any availability</option>
          {Object.entries(AVAILABILITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {hasPrices && (
          <>
            <input aria-label="Minimum price" type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min ₦" className={`${field} w-28`} />
            <input aria-label="Maximum price" type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max ₦" className={`${field} w-28`} />
          </>
        )}
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className={field}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          {hasPrices && <option value="price-asc">Price: low to high</option>}
          {hasPrices && <option value="price-desc">Price: high to low</option>}
        </select>
        {active && (
          <button onClick={clear} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "watch" : "watches"}</p>
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, limit).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">No watches match your search. Try clearing the filters.</p>
      )}
      {filtered.length > limit && (
        <div className="mt-12 text-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="rounded-full border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary hover:bg-primary hover:text-primary-foreground">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
