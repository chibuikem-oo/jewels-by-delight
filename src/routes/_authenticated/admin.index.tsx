import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminGate } from "@/components/admin/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { adminProductsQuery, fieldCls, isAdminQuery } from "@/lib/admin";
import { AVAILABILITY, BUCKET, brandCover, formatPrice, primaryImage, settingsQuery, signPath, sortBrands, type Brand } from "@/lib/catalog";
import { BrandCover } from "@/components/site/BrandCover";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin | JewelsByDelight" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  return <AdminGate><Dashboard /></AdminGate>;
}

function Dashboard() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(adminProductsQuery());
  const { data: brands = [] } = useQuery({
    queryKey: ["brands", "admin"],
    queryFn: async () => sortBrands(((await supabase.from("brands").select("*")).data ?? []) as Brand[]),
  });
  const { data: settings } = useQuery(settingsQuery());
  const [wa, setWa] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  useEffect(() => {
    setWa(settings?.whatsapp_number ?? "");
  }, [settings]);

  const stats = [
    ["Total watches", products.length],
    ["Published", products.filter((p) => p.is_published).length],
    ["Drafts", products.filter((p) => !p.is_published).length],
    ["Sold out", products.filter((p) => p.availability_status === "sold_out").length],
  ];

  async function saveWa() {
    const { error } = await supabase.from("site_settings").update({ whatsapp_number: wa.trim() || null, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) toast.error(error.message);
    else { toast.success("WhatsApp number saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
  }

  async function updateBrand(id: string, patch: Partial<Brand>) {
    const { error } = await supabase.from("brands").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Brand updated"); qc.invalidateQueries({ queryKey: ["brands"] }); }
  }

  async function uploadCover(b: Brand, file: File) {
    const path = `brands/${b.slug}/cover-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) {
      toast.error(error.message);
      return;
    }
    const url = await signPath(path);
    if (url) updateBrand(b.id, { cover_image_url: url });
  }

  const list = brandFilter ? products.filter((p) => p.brand_id === brandFilter) : products;

  return (
    <div className="space-y-14">
      {!settings?.whatsapp_number && (
        <div className="rounded-xl border border-gold bg-secondary p-4 text-sm">
          <strong>Setup reminder:</strong> add your WhatsApp number below. Until then, WhatsApp buttons on the site show "coming soon".
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{k}</p>
            <p className="mt-1 font-display text-4xl">{v}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-display text-2xl">WhatsApp number</h2>
        <div className="flex max-w-md gap-2">
          <input className={fieldCls} placeholder="e.g. 2348012345678" value={wa} onChange={(e) => setWa(e.target.value)} />
          <button onClick={saveWa} className="rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save</button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">International format with country code, digits only (234…).</p>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Watches</h2>
          <div className="flex gap-2">
            <select className={fieldCls} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="">All brands</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name} ({products.filter((p) => p.brand_id === b.id).length})</option>)}
            </select>
            <Link to="/admin/products/$id" params={{ id: "new" }} search={{ brand: brandFilter || undefined }} className="inline-flex shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
              + Add watch
            </Link>
          </div>
        </div>
        {list.length ? (
          <div className="divide-y rounded-xl border bg-card">
            {list.map((p) => {
              const img = primaryImage(p);
              return (
                <Link key={p.id} to="/admin/products/$id" params={{ id: p.id }} search={{}} className="flex items-center gap-4 p-3 hover:bg-secondary">
                  {img ? <img src={img.url} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="h-14 w-14 rounded-lg bg-secondary" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand?.name} · {formatPrice(p.price) ?? "No price"} · {AVAILABILITY[p.availability_status]}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${p.is_published ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{p.is_published ? "Published" : "Draft"}</span>
                  {p.is_featured && <span className="text-xs text-gold">★ Featured</span>}
                </Link>
              );
            })}
          </div>
        ) : <p className="text-muted-foreground">No watches yet. Click "Add watch" to start.</p>}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">Brands</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((b, idx) => (
            <BrandEditor key={b.id} brand={b} idx={idx} count={products.filter((p) => p.brand_id === b.id).length} onSave={updateBrand} onCover={uploadCover} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BrandEditor({ brand, idx, count, onSave, onCover }: { brand: Brand; idx: number; count: number; onSave: (id: string, p: Partial<Brand>) => void; onCover: (b: Brand, f: File) => void }) {
  const [desc, setDesc] = useState(brand.description ?? "");
  return (
    <div className="flex gap-4 rounded-xl border bg-card p-4">
      <BrandCover src={brandCover(brand, idx)} name={brand.name} className="h-24 w-20 shrink-0 overflow-hidden rounded-lg" imgClassName="object-cover" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium">{brand.name} <span className="text-xs text-muted-foreground">({count})</span></p>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={brand.is_active} onChange={(e) => onSave(brand.id, { is_active: e.target.checked })} /> Active
          </label>
        </div>
        <textarea className={`${fieldCls} h-16 py-2`} placeholder="Short description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <div className="flex gap-3 text-xs">
          <button onClick={() => onSave(brand.id, { description: desc || null })} className="text-primary underline">Save description</button>
          <label className="cursor-pointer text-primary underline">
            Replace cover
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onCover(brand, e.target.files[0])} />
          </label>
        </div>
      </div>
    </div>
  );
}
