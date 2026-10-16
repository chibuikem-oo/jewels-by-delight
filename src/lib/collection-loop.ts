import { primaryImage, sortBrands, type Product } from "@/lib/catalog";

export function selectCollectionCycle(products: Product[], random: () => number = Math.random): Product[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    if (!product.is_published || !product.brand || !primaryImage(product)?.url) continue;
    const group = groups.get(product.brand_id) ?? [];
    group.push(product);
    groups.set(product.brand_id, group);
  }
  const brands = sortBrands([...groups.entries()].map(([id, watches]) => ({ id, name: watches[0]?.brand?.name ?? "", watches })));
  return brands.flatMap(({ watches }) => {
    const shuffled = [...watches];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const a = shuffled[i];
      const b = shuffled[j];
      if (a && b) {
        shuffled[i] = b;
        shuffled[j] = a;
      }
    }
    return shuffled.slice(0, 3);
  });
}