import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSlider({ images }: { images: { src: string; alt: string }[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = images.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, go]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onTouchStart={(e) => (touch.current = e.touches[0]!.clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0]!.clientX - touch.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
      aria-roledescription="carousel"
    >
      <div className="flex h-full transition-transform duration-1000 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {images.map((img, idx) => (
          <div key={idx} className="relative h-full w-full shrink-0 overflow-hidden" aria-hidden={idx !== i}>
            <img
              src={img.src}
              alt={img.alt}
              width={1920}
              height={1088}
              loading={idx === 0 ? "eager" : "lazy"}
              className={cn("h-full w-full object-cover transition-transform duration-[7000ms] ease-out", idx === i ? "scale-105" : "scale-100")}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-foreground/35" />
      <div className="absolute bottom-8 right-6 z-20 flex items-center gap-3 text-primary-foreground sm:right-10">
        <button onClick={() => go(-1)} aria-label="Previous slide" className="hidden rounded-full border border-primary-foreground/50 p-2 hover:bg-primary-foreground/15 sm:block">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {images.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`} className={cn("h-1.5 rounded-full bg-primary-foreground transition-all", idx === i ? "w-8" : "w-3 opacity-50")} />
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="Next slide" className="hidden rounded-full border border-primary-foreground/50 p-2 hover:bg-primary-foreground/15 sm:block">
          <ChevronRight className="h-5 w-5" />
        </button>
        <button onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play slideshow" : "Pause slideshow"} className="rounded-full border border-primary-foreground/50 p-2 hover:bg-primary-foreground/15">
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
