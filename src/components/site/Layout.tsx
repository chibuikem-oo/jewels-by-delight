import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/brands", label: "Brands" },
  { to: "/our-story", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function Layout({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const light = overlay && !open;
  return (
    <div className="min-h-screen bg-background">
      <header className={cn("inset-x-0 top-0 z-30", overlay ? "absolute" : "sticky border-b bg-background/90 backdrop-blur")}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className={cn(
              "font-display text-2xl font-semibold tracking-[0.04em]",
              light ? "text-primary-foreground drop-shadow-sm" : "text-foreground",
            )}
          >
            Jewels<span className="italic text-gold">By</span>Delight
          </Link>
          <div className={cn("hidden items-center gap-8 text-sm font-medium tracking-wide md:flex", light ? "text-primary-foreground/90" : "text-foreground/80")}>
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-gold" }}
                className="transition-opacity hover:opacity-70"
              >
                {n.label}
              </Link>
            ))}
          </div>
          <button
            className={cn("md:hidden", light ? "text-primary-foreground" : "text-foreground")}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
        {open && (
          <div className="border-t bg-background px-6 pb-6 md:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block border-b py-4 font-display text-xl text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
          <span className="font-display text-lg text-foreground">JewelsByDelight</span>
          <div className="flex gap-6">
            <Link to="/collection" className="hover:text-foreground">Collection</Link>
            <Link to="/brands" className="hover:text-foreground">Brands</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
          <span>© {new Date().getFullYear()} JewelsByDelight</span>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-12 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h1 className="mt-3 text-balance font-display text-4xl font-medium sm:text-5xl">{title}</h1>
      {children && <p className="mt-4 leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}
