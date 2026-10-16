import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { productMessage, watchName, type Product } from "@/lib/catalog";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, ...props }: any) => <a href={to.replace("$slug", params?.slug ?? "")} {...props}>{children}</a>,
}));

const watch: Product = {
  id: "watch", brand_id: "brand", name: "User-supplied watch", slug: "user-supplied-watch",
  model: null, description: null, price: 100000, currency: "NGN", availability_status: "available",
  is_featured: false, is_published: true, strap_material: null, dial_colour: null,
  case_material: null, movement_type: null, water_resistance: null, created_at: "2026-10-16",
  brand: { id: "brand", name: "Poedagar", slug: "poedagar" },
  images: [{ id: "photo", product_id: "watch", storage_path: "photo.jpg", alt_text: "Watch photo", is_primary: true, display_order: 0, url: "/photo.jpg" }],
};

describe("Photo-only watch catalog", () => {
  it("shows the watch photo and purchase message without any price controls", () => {
    const client = new QueryClient();
    client.setQueryData(["settings"], { whatsapp_number: "2348132846147" });
    render(<QueryClientProvider client={client}><CatalogBrowser products={[watch]} /></QueryClientProvider>);
    expect(screen.getByAltText("Watch photo")).toBeTruthy();
    expect(screen.queryByText(/price/i)).toBeNull();
    expect(screen.queryByLabelText("Minimum price")).toBeNull();
    const link = screen.getByRole("link", { name: "Message to buy on WhatsApp" });
    expect(link.getAttribute("href")).toBe(`https://wa.me/2348132846147?text=${encodeURIComponent(productMessage(watch))}`);
    expect(productMessage(watch)).toContain("I'd like to buy the Poedagar watch");
  });

  it.each(["Audemars Piguet", "Cartier", "Casio", "Curren", "Hislon", "Hublot", "Megir", "Michael Kors", "Patek Philippe", "Poedagar", "Richard Mille", "Rolex", "Tissot", "Tommy Hilfiger"])("uses only %s for watch names and enquiries", (name) => {
    const brand = { id: "brand", slug: "brand", name };
    expect(watchName(brand)).toBe(name);
    expect(productMessage({ name: `${name} watch 8`, brand })).toBe(`Hello JewelsByDelight, I'd like to buy the ${name} watch I saw on your website. Is it available?`);
  });
});