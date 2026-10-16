import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AVAILABILITY, sortBrands, type Product } from "@/lib/catalog";
import { EmptyCollection, ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";

const PAGE = 24;

export function CatalogBrowser({ products, showBrandFilter = true }: { products: Product[]; showBrandFilter?: boolean }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [avail, setAvail] = useState("");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(PAGE);

  const brands = useMemo(() => {
    const m = new Map<string, { id: string; name: string }>();
    products.forEach((p) => p.brand && m.set(p.brand.id, p.brand));
    return sortBrands([...m.values()]);
  }, [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (term && ![p.name, p.model, p.brand?.name].some((v) => v?.toLowerCase().includes(term))) return false;
      if (brand && p.brand_id !== brand) return false;
      if (avail && p.availability_status !== avail) return false;
      return true;
    });
    const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    if (sort === "name") list = [...list].sort(byName);
    return list;
  }, [products, q, brand, avail, sort]);

  const active = q || brand || avail || sort !== "newest";
  const clear = () => {
    setQ(""); setBrand(""); setAvail(""); setSort("newest");
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
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className={field}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
        </select>
        {active && (
          <Button variant="link" onClick={clear} className="gap-1">
            <X className="h-4 w-4" /> Clear filters
          </Button>
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
          <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)} className="rounded-full px-8">
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
