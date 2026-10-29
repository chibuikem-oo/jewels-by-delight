<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Project rules
- Catalog data (brands, products, product_images, site_settings) lives in Supabase and is read with the browser client in route loaders via TanStack Query (src/lib/catalog.ts); never hardcode products.
- Watch photos are in the private `watch-images` bucket (workspace blocks public buckets); always display them via signed URLs.
- Public SELECT policies must not call has_role (anon cannot execute it); admin access is a separate `for all to authenticated` policy.
- Brand display order is computed client-side with sortBrands (case-insensitive name), never by insert order.
- Keep watch prices out of public and admin presentation while retaining existing database columns; this preserves stored data without adding an on-site sales flow.
- WhatsApp buttons use the loader-prefetched settings query with suspense so server and browser render the same contact action.
- Both watch upload paths use watchName from the selected brand, backed by the database naming trigger on every insert/update; hidden descriptive fields retain stored values so the simplified editor does not erase catalog data.
- Bulk collection uploads create one draft watch per photo under the chosen brand (storage brands/<brand-slug>/<watch-slug>/); they never touch brand covers, so covers and collection photos stay separate.
- Homepage collection animation uses CollectionLoop with the pure selectCollectionCycle helper over loader-prefetched published products; attach signed photo URLs after hydration to avoid mismatches between server and browser reads while preserving brand coverage and other catalog purchase actions.
- Purchase enquiries include the watch's own photo as a short /api/public/watch-photo/$slug redirect (src/routes/api/public/watch-photo/$slug.ts) that signs a fresh URL per visit, so links stay stable after publishing; build any absolute site link from the origin only after hydration (src/lib/site-origin.ts) so server and browser markup match.
- Every uploaded photo is shrunk in the browser (src/lib/image-compress.ts) before storage, and each watch photo gets a small `<path>.thumb.jpg` copy used by cards and the homepage loop; this keeps Supabase download usage within plan limits. Delete the thumb alongside its photo.
- Signed photo links are remembered in the browser (catalog.ts link cache) and photo `src` is attached only after hydration, so repeat visits reuse cached photos instead of downloading them again.
- When the catalog can't be reached, the root error page and src/lib/error-page.ts show a branded "We'll be back shortly" screen with a WhatsApp link (src/lib/contact-fallback.ts), never a blank screen.
