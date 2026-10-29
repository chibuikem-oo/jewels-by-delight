import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { forgetPhotoLinks, primaryImage, type Product } from "@/lib/catalog";
import { selectCollectionCycle } from "@/lib/collection-loop";

function preload(urls: string[]) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const preloader = new Image();
          preloader.onload = () => resolve();
          preloader.onerror = () => resolve();
          preloader.src = url;
        }),
    ),
  );
}

export function CollectionLoop({ products }: { products: Product[] }) {
  const queryClient = useQueryClient();
  // Signed photo links expire; if one fails to load, refetch fresh links once.
  const refreshed = useRef(false);
  const retryFreshLinks = () => {
    if (refreshed.current) return;
    refreshed.current = true;
    forgetPhotoLinks();
    queryClient.invalidateQueries({ queryKey: ["products", "published"] });
  };
  const [photosReady, setPhotosReady] = useState(false);
  // Deterministic first render keeps server and browser markup identical.
  const [cycles, setCycles] = useState(() => {
    const initial = selectCollectionCycle(products, () => 0.999);
    return [initial, initial];
  });
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const firstCycle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Signed URLs can differ between loader reads; attach them only after hydration.
    const next = [selectCollectionCycle(products), selectCollectionCycle(products)];
    setCycles(next);
    const urls = next.flat().map((product) => primaryImage(product)?.thumb_url).filter((url): url is string => Boolean(url));
    let cancelled = false;
    let started = false;
    const element = viewport.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let offset = 0;
    let lastTime = 0;
    let frame = 0;
    // Photos download only once the loop is about to scroll into view, then all appear together.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const near = entry?.isIntersecting ?? false;
        visible = near;
        if (near && !started) {
          started = true;
          preload(urls).then(() => {
            if (!cancelled) setPhotosReady(true);
          });
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(element);

    const advance = (time: number) => {
      const width = firstCycle.current?.getBoundingClientRect().width ?? 0;
      if (visible && !reducedMotion.matches && !document.hidden && width > 0) {
        offset += Math.min(time - (lastTime || time), 64) * 0.07;
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
      cancelled = true;
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
                  <img src={photosReady ? image?.thumb_url : undefined} alt={product.brand?.name ?? product.name} className="h-full w-full object-cover" decoding="async" onError={retryFreshLinks} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}