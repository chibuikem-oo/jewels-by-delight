import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

export function ProductRail({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [touch-action:pan-x_pan-y]">
        {products.map((p) => (
          <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-[40%] lg:w-[23%]">
            <ProductCard product={p} showEnquiry={false} />
          </div>
        ))}
        <div className="w-2 shrink-0" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="mt-6 hidden justify-end gap-2 sm:flex">
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className="rounded-full border p-2 hover:bg-secondary"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => scroll(1)} aria-label="Scroll right" className="rounded-full border p-2 hover:bg-secondary"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
