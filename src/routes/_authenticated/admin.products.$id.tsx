import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { fieldCls } from "@/lib/admin";
import { AVAILABILITY, BUCKET, fetchProducts, slugify, sortBrands, watchName, type Brand, type ProductImage } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  validateSearch: (s: Record<string, unknown>): { brand?: string | undefined } => ({ brand: typeof s["brand"] === "string" ? (s["brand"] as string) : undefined }),
  head: () => ({ meta: [{ title: "Edit watch | JewelsByDelight" }, { name: "description", content: "Manage individual watch photos and brand assignments at JewelsByDelight." }, { property: "og:title", content: "Edit watch | JewelsByDelight" }, { property: "og:description", content: "Manage individual watch photos and brand assignments." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGate><Editor /></AdminGate>,
});

const empty = {
  brand_id: "", name: "", model: "", description: "", availability_status: "available",
  is_featured: false, is_published: false, strap_material: "", dial_colour: "", case_material: "", movement_type: "", water_resistance: "",
};
type Form = typeof empty;
type Pending = { file: File; preview: string };

function Editor() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>({ ...empty, brand_id: search.brand ?? "" });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: brands = [] } = useQuery({
    queryKey: ["brands", "admin"],
    queryFn: async () => sortBrands(((await supabase.from("brands").select("*")).data ?? []) as Brand[]),
  });
  const { data: product } = useQuery({
    queryKey: ["product-admin", id],
    enabled: !isNew,
    queryFn: async () => (await fetchProducts({ all: true })).find((p) => p.id === id) ?? null,
  });

  useEffect(() => {
    if (!product) return;
    setSlug(product.slug);
    setImages(product.images);
    setForm({
      brand_id: product.brand_id, name: product.name, model: product.model ?? "", description: product.description ?? "",
      availability_status: product.availability_status,
      is_featured: product.is_featured, is_published: product.is_published, strap_material: product.strap_material ?? "",
      dial_colour: product.dial_colour ?? "", case_material: product.case_material ?? "", movement_type: product.movement_type ?? "",
      water_resistance: product.water_resistance ?? "",
    });
  }, [product]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const brand = brands.find((b) => b.id === form.brand_id);

  async function save(another = false) {
    if (!brand) {
      toast.error("Choose a brand.");
      return;
    }
    setBusy(true);
    try {
      const n = (v: string) => v.trim() || null;
      const row = {
        brand_id: brand.id, name: watchName(brand), model: n(form.model), description: n(form.description),
        availability_status: form.availability_status,
        is_featured: form.is_featured, is_published: form.is_published, strap_material: n(form.strap_material),
        dial_colour: n(form.dial_colour), case_material: n(form.case_material), movement_type: n(form.movement_type),
        water_resistance: n(form.water_resistance),
      };
      let pid = id;
      let pslug = slug;
      if (isNew) {
        pslug = `${slugify(`${brand?.name} ${row.name} ${form.model}`)}-${Math.random().toString(36).slice(2, 6)}`;
        const { data, error } = await supabase.from("products").insert({ ...row, slug: pslug }).select("id").single();
        if (error) throw error;
        pid = data.id;
      } else {
        const { error } = await supabase.from("products").update(row).eq("id", id);
        if (error) throw error;
      }
      // existing image order / primary
      const hasPrimary = images.some((i) => i.is_primary);
      for (const [k, im] of images.entries()) {
        await supabase.from("product_images").update({ display_order: k, is_primary: hasPrimary ? im.is_primary : k === 0 }).eq("id", im.id);
      }
      // uploads
      for (const [k, p] of pending.entries()) {
        const photo = await compressImage(p.file);
        const path = `brands/${brand?.slug}/${pslug}/${Date.now()}-${k}.jpg`;
        const up = await supabase.storage.from(BUCKET).upload(path, photo, { contentType: "image/jpeg", cacheControl: PHOTO_CACHE_SECONDS });
        if (up.error) throw up.error;
        const order = images.length + k;
        const { error } = await supabase.from("product_images").insert({
          product_id: pid, storage_path: path, display_order: order,
          is_primary: !images.length && !hasPrimary && k === 0,
          alt_text: `${row.name}${k ? ` photo ${order + 1}` : ""}`,
        });
        if (error) throw error;
      }
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["product-admin"] });
      setPending([]);
      toast.success("Watch saved");
      if (another) {
        setForm({ ...empty, brand_id: form.brand_id });
        setImages([]);
        setSlug(null);
        nav({ to: "/admin/products/$id", params: { id: "new" }, search: { brand: form.brand_id } });
      } else if (isNew) {
        nav({ to: "/admin/products/$id", params: { id: pid }, search: { brand: undefined } });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
    setBusy(false);
  }

  async function removeImage(im: ProductImage) {
    if (!confirm("Remove this photo?")) return;
    await supabase.from("product_images").delete().eq("id", im.id);
    await supabase.storage.from(BUCKET).remove([im.storage_path]);
    setImages((l) => l.filter((x) => x.id !== im.id));
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function del() {
    if (!confirm("Delete this watch and all its photos?")) return;
    await supabase.storage.from(BUCKET).remove(images.map((i) => i.storage_path));
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["products"] });
    nav({ to: "/admin" });
  }

  const move = (k: number, d: number) =>
    setImages((l) => {
      const c = [...l];
      const j = k + d;
      if (j < 0 || j >= c.length) return l;
      const current = c[k];
      const target = c[j];
      if (!current || !target) return l;
      [c[k], c[j]] = [target, current];
      return c;
    });

  return (
    <div>
      <Link to="/admin" className="text-sm text-primary underline">← Back to dashboard</Link>
      <h2 className="mt-4 font-display text-3xl">{isNew ? "Add a watch" : brand?.name || "Edit watch"}</h2>
      {brand && <p className="text-sm text-muted-foreground">Brand: {brand.name}</p>}
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Brand *</span>
            <select className={fieldCls} value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
              <option value="">Choose a brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Availability</span>
            <select className={fieldCls} value={form.availability_status} onChange={(e) => set("availability_status", e.target.value)}>
              {Object.entries(AVAILABILITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} /> Published (visible on site)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured on home page</label>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted-foreground">Photos {brand && `for ${brand.name}`}</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((im, k) => (
              <div key={im.id} className={`relative overflow-hidden rounded-lg border-2 ${im.is_primary ? "border-gold" : "border-transparent"}`}>
                <img src={im.url} alt="" className="aspect-square w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/85 p-1">
                  <button title="Set as main photo" onClick={() => setImages((l) => l.map((x) => ({ ...x, is_primary: x.id === im.id })))}><Star className={`h-4 w-4 ${im.is_primary ? "fill-gold text-gold" : ""}`} /></button>
                  <button title="Move earlier" onClick={() => move(k, -1)}><ArrowUp className="h-4 w-4" /></button>
                  <button title="Move later" onClick={() => move(k, 1)}><ArrowDown className="h-4 w-4" /></button>
                  <button title="Remove" onClick={() => removeImage(im)}><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>
            ))}
            {pending.map((p, k) => (
              <div key={p.preview} className="relative overflow-hidden rounded-lg border-2 border-dashed">
                <img src={p.preview} alt="" className="aspect-square w-full object-cover opacity-80" />
                <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 text-[10px]">Not saved</span>
                <button className="absolute right-1 top-1 rounded bg-background/90 p-0.5" onClick={() => setPending((l) => l.filter((_, j) => j !== k))}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-center text-xs text-muted-foreground hover:bg-secondary">
              + Add photos
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                setPending((l) => [...l, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
                e.target.value = "";
              }} />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Star = main photo. New photos upload when you save. Max 10 MB each.</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button disabled={busy} onClick={() => save(false)} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        <button disabled={busy} onClick={() => save(true)} className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary disabled:opacity-60">Save & add another {brand?.name ?? ""}</button>
        {!isNew && slug && form.is_published && <Link to="/watches/$slug" params={{ slug }} className="px-4 py-3 text-sm text-primary underline">View on site</Link>}
        {!isNew && <button onClick={del} className="ml-auto px-4 py-3 text-sm text-destructive underline">Delete watch</button>}
      </div>
    </div>
  );
}
