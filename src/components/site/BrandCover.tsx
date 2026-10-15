import { useState } from "react";
import { cn } from "@/lib/utils";

/** Real brand cover if uploaded; otherwise a clean, text-only placeholder (never a generic photo). */
export function BrandCover({
  src,
  name,
  className,
  imgClassName,
  width,
  height,
}: {
  src: string | null;
  name: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name} watches`}
        loading="lazy"
        width={width}
        height={height}
        onError={() => setFailed(true)}
        className={cn(className, imgClassName)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${name} — photo coming soon`}
      className={cn(
        className,
        "flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary",
      )}
    >
      <span className="font-display text-6xl font-medium text-accent/60">{name.charAt(0)}</span>
      <span className="mt-2 h-px w-10 bg-accent/40" />
    </div>
  );
}
