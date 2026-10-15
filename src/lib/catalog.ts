import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import watch1 from "@/assets/watch-1.jpg";
import watch2 from "@/assets/watch-2.jpg";
import watch3 from "@/assets/watch-3.jpg";
import watch4 from "@/assets/watch-4.jpg";
import watch5 from "@/assets/watch-5.jpg";
import watch6 from "@/assets/watch-6.jpg";

export const BUCKET = "watch-images";
export const heroImages = [watch1, watch2, watch3];
const fallbackCovers = [watch4, watch5, watch6, watch1, watch2, watch3];

export type Brand = {
  id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  url: string;
};

export type Product = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  model: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  availability_status: string;
  is_featured: boolean;
  is_published: boolean;
  strap_material: string | null;
  dial_colour: string | null;
  case_material: string | null;
  movement_type: string | null;
  water_resistance: string | null;
  created_at: string;
  brand: { id: string; name: string; slug: string } | null;
  images: ProductImage[];
};

export const AVAILABILITY: Record<string, string> = {
  available: "Available",
  limited: "Limited stock",
  on_request: "On request",
  sold_out: "Sold out",
};

export function sortBrands<T extends { name: string }>(brands: T[]): T[] {
  return [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
}

export function brandCover(brand: Pick<Brand, "cover_image_url" | "slug">, index = 0) {
  if (brand.cover_image_url) return brand.cover_image_url;
  return fallbackCovers[index % fallbackCovers.length];
}

export function formatPrice(price: number | null) {
  if (price == null) return null;
  return "₦" + Number(price).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function primaryImage(p: Product) {
  return p.images.find((i) => i.is_primary) ?? p.images[0];
}

// Images live in a private bucket; signed URLs are issued per read.
async function signImages(rows: Omit<ProductImage, "url">[]): Promise<ProductImage[]> {
  if (!rows.length) return [];
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      rows.map((r) => r.storage_path),
      60 * 60 * 24 * 7,
    );
  const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return rows.map((r) => ({ ...r, url: (map.get(r.storage_path) as string | undefined) ?? "" }));
}

export async function signPath(path: string) {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? null;
}

const PRODUCT_SELECT =
  "*, brand:brands(id,name,slug), images:product_images(id,product_id,storage_path,alt_text,is_primary,display_order)";

async function hydrate(rows: any[]): Promise<Product[]> {
  const all = rows.flatMap((r) => r.images ?? []);
  const signed = await signImages(all);
  const byId = new Map(signed.map((s) => [s.id, s]));
  return rows.map((r) => ({
    ...r,
    price: r.price == null ? null : Number(r.price),
    images: (r.images ?? [])
      .map((i: any) => byId.get(i.id)!)
      .sort((a: ProductImage, b: ProductImage) => a.display_order - b.display_order),
  }));
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from("brands").select("*");
  if (error) throw error;
  return sortBrands((data ?? []) as Brand[]);
}

export async function fetchProducts(opts: { brandId?: string; featured?: boolean; all?: boolean } = {}) {
  let q = supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
  if (!opts.all) q = q.eq("is_published", true);
  if (opts.brandId) q = q.eq("brand_id", opts.brandId);
  if (opts.featured) q = q.eq("is_featured", true);
  const { data, error } = await q;
  if (error) throw error;
  return hydrate(data ?? []);
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return (await hydrate([data]))[0];
}

export async function fetchSettings() {
  const { data } = await supabase.from("site_settings").select("whatsapp_number").eq("id", 1).maybeSingle();
  return { whatsapp_number: (data?.whatsapp_number as string | null) ?? null };
}

export const brandsQuery = () => queryOptions({ queryKey: ["brands"], queryFn: fetchBrands });
export const productsQuery = () => queryOptions({ queryKey: ["products", "published"], queryFn: () => fetchProducts() });
export const featuredQuery = () =>
  queryOptions({ queryKey: ["products", "featured"], queryFn: () => fetchProducts({ featured: true }) });
export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => fetchProductBySlug(slug) });
export const settingsQuery = () => queryOptions({ queryKey: ["settings"], queryFn: fetchSettings });

export function whatsappLink(number: string | null, message?: string) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function productMessage(p: Pick<Product, "name" | "brand">) {
  const brand = p.brand?.name ?? "";
  return `Hello JewelsByDelight, I'm interested in the ${brand} ${p.name}. Please let me know its price, availability and how I can order it.`;
}
