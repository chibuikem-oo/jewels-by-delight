import { describe, expect, it } from "vitest";
import { selectCollectionCycle } from "@/lib/collection-loop";
import type { Product } from "@/lib/catalog";

const brands = ["Audemars Piguet", "Cartier", "Casio", "Curren", "Hislon", "Hublot", "Megir", "Michael Kors", "Patek Philippe", "Poedagar", "Richard Mille", "Rolex", "Tissot", "Tommy Hilfiger"];
function watch(brand: string, index: number): Product {
  const id = `${brand}-${index}`;
  return {
    id, brand_id: brand, name: brand, slug: id, brand: { id: brand, name: brand, slug: brand },
    is_published: true, is_featured: false, availability_status: "available", created_at: "2026-10-16",
    model: null, description: null, price: null, currency: "NGN", strap_material: null,
    dial_colour: null, case_material: null, movement_type: null, water_resistance: null,
    images: [{ id, product_id: id, storage_path: `${id}.jpg`, url: `/${id}.jpg`, thumb_url: `/${id}.thumb.jpg`, alt_text: null, is_primary: true, display_order: 0 }],
  };
}

describe("Homepage collection cycles", () => {
  it("selects three distinct watch photos from each of all 14 brands", () => {
    const products = brands.flatMap((brand) => Array.from({ length: 7 }, (_, i) => watch(brand, i)));
    const cycle = selectCollectionCycle(products);
    expect(cycle).toHaveLength(42);
    for (const brand of brands) {
      const selected = cycle.filter((product) => product.brand_id === brand);
      expect(selected).toHaveLength(3);
      expect(new Set(selected.map((product) => product.id)).size).toBe(3);
    }
  });

  it("uses available photos only when a brand has fewer than three, excluding drafts and missing photos", () => {
    const first = watch("Casio", 0);
    const second = watch("Casio", 1);
    const draft = { ...watch("Casio", 2), is_published: false };
    const missing = { ...watch("Rolex", 0), images: [] };
    expect(selectCollectionCycle([first, second, draft, missing]).map((p) => p.id).sort()).toEqual([first.id, second.id]);
  });

  it("draws a fresh random selection for the next cycle without mutating the catalog", () => {
    const products = Array.from({ length: 8 }, (_, i) => watch("Poedagar", i));
    const original = products.map((p) => p.id);
    const first = selectCollectionCycle(products, () => 0.999).map((p) => p.id);
    const next = selectCollectionCycle(products, () => 0).map((p) => p.id);
    expect(first).toEqual(["Poedagar-0", "Poedagar-1", "Poedagar-2"]);
    expect(next).toEqual(["Poedagar-1", "Poedagar-2", "Poedagar-3"]);
    expect(next).not.toEqual(first);
    expect(products.map((p) => p.id)).toEqual(original);
  });
});