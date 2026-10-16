import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fieldCls } from "@/lib/admin";
import { BUCKET, primaryImage, slugify, type Brand, type Product } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

type Item = { key: string; file: File; preview: string; status: "pending" | "uploading" | "done" | "failed"; error?: string };

/**
 * Bulk upload: each photo becomes its own draft watch under the chosen brand
 * (stored at brands/<brand>/<watch>/...). Brand covers are never touched.
 */
export function ManageCollections({ brands, products }: { brands: Brand[]; products: Product[] }) {
  const qc = useQueryClient();
  const [brandId, setBrandId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const brand = brands.find((b) => b.id === brandId);
  const drafts = products.filter((p) => p.brand_id === brandId && !p.is_published);

  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(files: FileList | null) {
    if (!files) return;
    const next = [...files].filter((f) => f.type.startsWith("image/")).map((file, k) => ({
      key: `${Date.now()}-${k}-${file.name}`, file, preview: URL.createObjectURL(file), status: "pending" as const,
    }));
    setItems((cur) => [...cur.filter((i) => i.status !== "done"), ...next]);
  }

  const set = (key: string, patch: Partial<Item>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  async function uploadOne(it: Item, n: number) {
    if (!brand) return;
    set(it.key, { status: "uploading", error: undefined });
    try {
      if (it.file.size > 10 * 1024 * 1024) throw new Error("Larger than 10 MB");
      const slug = `${slugify(brand.name)}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const { data: prod, error: pe } = await supabase.from("products")
        .insert({ brand_id: brand.id, name: `${brand.name} watch ${n}`, slug, is_published: false, availability_status: "available" })
        .select("id").single();
      if (pe) throw pe;
      const ext = it.file.name.split(".").pop() || "jpg";
      const path = `brands/${brand.slug}/${slug}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, it.file, { contentType: it.file.type });
      if (up.error) { await supabase.from("products").delete().eq("id", prod.id); throw up.error; }
      const { error: ie } = await supabase.from("product_images").insert({ product_id: prod.id, storage_path: path, is_primary: true, display_order: 0, alt_text: `${brand.name} watch` });
      if (ie) throw ie;
      set(it.key, { status: "done" });
    } catch (e: any) {
      set(it.key, { status: "failed", error: e?.message ?? "Upload failed" });
    }
  }

  async function uploadAll() {
    if (!brand) return toast.error("Select a brand first");
    setBusy(true);
    const queue = items.filter((i) => i.status === "pending" || i.status === "failed");
    let n = products.filter((p) => p.brand_id === brand.id).length;
    for (let i = 0; i < queue.length; i += 3) {
      await Promise.all(queue.slice(i, i + 3).map((it, j) => uploadOne(it, n + i + j + 1)));
    }
    n += queue.length;
    setBusy(false);
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Upload finished — review the drafts below, then publish");
  }

  async function publish(ids: string[]) {
    if (!ids.length) return;
    const { error } = await supabase.from("products").update({ is_published: true }).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} watch${ids.length === 1 ? "" : "es"} published to ${brand?.name}`);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function discard(p: Product) {
    const paths = p.images.map((i) => i.storage_path);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from("products").delete().eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  const done = items.filter((i) => i.status === "done").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const todo = items.filter((i) => i.status === "pending" || i.status === "failed").length;

  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="font-display text-2xl">Manage Collections</h2>
      <p className="mt-1 text-sm text-muted-foreground">Upload many watch photos to a brand at once. Each photo becomes one watch. Brand covers are not changed.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select aria-label="Brand" className={`${fieldCls} max-w-xs`} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">Select a brand…</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <label className={`inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground ${!brand ? "pointer-events-none opacity-50" : ""}`}>
          Upload Watch Images
          <input type="file" multiple accept="image/*" className="hidden" disabled={!brand} onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
        </label>
        {todo > 0 && <Button onClick={uploadAll} disabled={busy || !brand}>{busy ? "Uploading…" : `Start upload (${todo})`}</Button>}
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm">{done} of {items.length} uploaded{failed ? ` · ${failed} failed` : ""}</p>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
            {items.map((i) => (
              <div key={i.key} className="relative overflow-hidden rounded-lg border" title={i.error ?? i.file.name}>
                <img src={i.preview} alt="" className="aspect-square w-full object-cover" />
                <span className="absolute right-1 top-1 rounded-full bg-card p-0.5">
                  {i.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {i.status === "done" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  {i.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                </span>
                {i.status === "pending" && (
                  <button onClick={() => setItems((c) => c.filter((x) => x.key !== i.key))} className="absolute left-1 top-1 rounded-full bg-card px-1.5 text-xs">×</button>
                )}
                {i.status === "failed" && <p className="truncate bg-destructive/10 px-1 text-[10px] text-destructive">{i.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {brand && (
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">Preview — {drafts.length} unpublished {brand.name} photo{drafts.length === 1 ? "" : "s"}</h3>
            {drafts.length > 0 && <Button onClick={() => publish(drafts.map((d) => d.id))}>Publish all to {brand.name}</Button>}
          </div>
          {drafts.length ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
              {drafts.map((p) => {
                const img = primaryImage(p);
                return (
                  <div key={p.id} className="overflow-hidden rounded-lg border">
                    {img ? <img src={img.url} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-secondary" />}
                    <div className="flex justify-between px-1.5 py-1 text-[11px]">
                      <button onClick={() => publish([p.id])} className="text-primary underline">Publish</button>
                      <button onClick={() => discard(p)} className="text-destructive underline">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground">Nothing waiting to be published for this brand.</p>}
        </div>
      )}
    </section>
  );
}
