import { useEffect, useRef, useState } from "react";
import { primaryImage, type Product } from "@/lib/catalog";
import { selectCollectionCycle } from "@/lib/collection-loop";

export function CollectionLoop({ products }: { products: Product[] }) {
  // Deterministic first render keeps server and browser markup identical.
  const [cycles, setCycles] = useState(() => {
    const initial = selectCollectionCycle(products, () => 0.999);
    return [initial, initial];
  });
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const firstCycle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCycles([selectCollectionCycle(products), selectCollectionCycle(products)]);
    const element = viewport.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let offset = 0;
    let lastTime = 0;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; });
    observer.observe(element);

    const advance = (time: number) => {
      const width = firstCycle.current?.getBoundingClientRect().width ?? 0;
      if (visible && !reducedMotion.matches && !document.hidden && width > 0) {
        offset += Math.min(time - (lastTime || time), 64) * 0.036;
        if (offset >= width) {
          offset -= width;
          setCycles((previous) => [previous[1] ?? [], selectCollectionCycle(products)]);
        }
      }
      if (track.current) track.current.style.transform = `translate3d(${-offset}px, 0, 0)`;
      lastTime = time;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [products]);

  if (!cycles[0]?.length) return null;

  return (
    <div ref={viewport} className="watch-loop" role="region" aria-label="Watch collections">
      <div ref={track} className="watch-loop-track">
        {cycles.map((cycle, index) => (
          <div key={index} ref={index === 0 ? firstCycle : undefined} className="watch-loop-cycle" aria-hidden={index === 1 ? true : undefined}>
            {cycle.map((product) => {
              const image = primaryImage(product);
              return (
                <div key={product.id} className="watch-loop-photo overflow-hidden rounded-lg bg-secondary">
                  <img src={image?.url} alt={product.brand?.name ?? product.name} className="h-full w-full object-cover" decoding="async" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}