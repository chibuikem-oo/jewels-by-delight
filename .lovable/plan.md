# JewelsByDelight — Wristwatch Catalog Transformation

## What I found
- One-page jewelry site (hero, 6 hardcoded jewelry pieces, story, email footer). Warm Sand palette, Cormorant Garamond + Karla.
- Your Supabase project is connected but empty: no tables, no storage buckets, no admin login yet. Nothing will be overwritten.

## What will be built

**Pages**
- Home: hero slideshow (swipe, arrows, dots, autoplay with pause, honours reduced motion), "Time. Elegance. Individuality.", featured watches (admin-chosen), swipeable "Discover Your Next Timepiece" carousel, 14 brand cards A–Z, WhatsApp closing call to action.
- Collection: every published watch, with search (brand/model/name), brand filter, price range, availability filter, sorting, "clear filters", and a polite empty state.
- Brands: directory of the 14 brands, sorted alphabetically from the data.
- Brand page (e.g. /brands/casio): cover, description, that brand's watches only, search/filters, empty-state message.
- Watch page (/watches/<name>): photo gallery with thumbnails, swipe, previous/next, larger view; brand, model, price in ₦, specs you enter, availability, breadcrumb, WhatsApp enquiry with a prefilled message.
- Our Story: two-column layout with your supplied copy.
- Contact: WhatsApp-first page with your supplied copy. Email removed.
- Admin (sign-in required): summary counts from the database, brand editing (description, cover, active on/off), watch editor (brand, name, model, price, description, specs, availability, featured, draft/published), multi-photo upload with preview, choose main photo, reorder, remove; WhatsApp number setting with a reminder when it's empty.

**Design**: keeps the warm ivory/sand/champagne look, refined to your palette (#F9F6F0, #F0E9DD, #453528, #B58A56, #79583C). Mobile menu added. All jewelry text and images removed.

## Things to be honest about
- **Brand covers**: official brand photos are copyrighted, and I can't get permission to reuse them. Each brand will start with a neutral, generic watch image (not labelled official) that you can replace from the admin area with your own photos.
- **Hero**: same, a slideshow of neutral watch images until you upload your own. It's a slideshow, not a video.
- **No products are invented.** The catalog starts empty until you add watches.
- **WhatsApp number**: entered in the admin area. Until then, WhatsApp buttons show "coming soon" instead of a broken link.
- **Admin account**: after this, you sign up once at /admin/login; I'll then make that account the administrator. Others who sign up get no editing rights.
- "Hislon" spelled as given; please check your packaging.

## Technical details
- Tables: `brands` (14 seeded, unique slug, alphabetical by `lower(name)`), `products` (FK brand_id, numeric(12,2) price, currency default NGN, availability enum-like text, is_featured, is_published, spec columns, unique slug), `product_images` (FK product_id, storage_path, is_primary, display_order), `site_settings` (whatsapp_number), `user_roles` + `has_role()` security-definer function.
- RLS: anon/auth read only active brands, published products and their images; all writes require `has_role(auth.uid(),'admin')`. GRANTs per table.
- Storage: public-read bucket `watch-images`, paths `brands/<brand>/<product>/<file>`; insert/update/delete only for admins.
- Data reads via TanStack Query in route loaders using the browser Supabase client; per-route head() for SEO (e.g. "Casio Watches | JewelsByDelight").
- Admin routes under a protected `_authenticated` layout; security enforced by policies, not hidden buttons.
