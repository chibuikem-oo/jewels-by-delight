import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Stable, short link to a published watch's own photo, used inside WhatsApp
// enquiries: /api/public/watch-photo/<slug> redirects to a freshly signed copy.
const BUCKET = "watch-images";
const SLUG = /^[a-z0-9-]{1,120}$/;

type ImageRow = { storage_path: string; is_primary: boolean; display_order: number };

function publishableClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing Supabase environment variables for public watch photo reads.");
  // Supabase publishable keys are opaque strings, not JWTs: send apikey, drop the bearer.
  const opaque = key.startsWith("sb_");
  return createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
        if (opaque && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function photoRedirect(slug: string | undefined): Promise<Response> {
  if (!slug || !SLUG.test(slug)) return new Response("Not found", { status: 404 });
  const supabase = publishableClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug,is_published,images:product_images(storage_path,is_primary,display_order)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !data) return new Response("Not found", { status: 404 });
  const rows = ((data as { images?: ImageRow[] }).images ?? []) as ImageRow[];
  const ordered = [...rows].sort((a, b) => a.display_order - b.display_order);
  const image = ordered.find((row) => row.is_primary) ?? ordered[0];
  if (!image?.storage_path) return new Response("Not found", { status: 404 });
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(image.storage_path, 60 * 10);
  if (!signed?.signedUrl) return new Response("Not found", { status: 404 });
  return new Response(null, {
    status: 302,
    headers: { Location: signed.signedUrl, "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/watch-photo/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => photoRedirect(params.slug),
      HEAD: async ({ params }) => photoRedirect(params.slug),
    },
  },
});
