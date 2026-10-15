create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.update_updated_at_column() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;

create table public.brands (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, cover_image_url text, description text, is_active boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select on public.brands to anon, authenticated; grant insert, update, delete on public.brands to authenticated; grant all on public.brands to service_role;
alter table public.brands enable row level security;
create policy "Public reads active brands" on public.brands for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "Admins manage brands" on public.brands for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger brands_updated before update on public.brands for each row execute function public.update_updated_at_column();

create table public.products (id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete restrict, name text not null, slug text not null unique, model text, description text, price numeric(12,2), currency text not null default 'NGN', availability_status text not null default 'available', is_featured boolean not null default false, is_published boolean not null default false, strap_material text, dial_colour text, case_material text, movement_type text, water_resistance text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index products_brand_idx on public.products(brand_id);
grant select on public.products to anon, authenticated; grant insert, update, delete on public.products to authenticated; grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public reads published products" on public.products for select to anon, authenticated using (is_published or public.has_role(auth.uid(),'admin'));
create policy "Admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_updated before update on public.products for each row execute function public.update_updated_at_column();

create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, storage_path text not null, alt_text text, is_primary boolean not null default false, display_order int not null default 0, created_at timestamptz not null default now());
create index product_images_product_idx on public.product_images(product_id);
grant select on public.product_images to anon, authenticated; grant insert, update, delete on public.product_images to authenticated; grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "Public reads images of published products" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.has_role(auth.uid(),'admin'))));
create policy "Admins manage images" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.site_settings (id int primary key default 1, whatsapp_number text, updated_at timestamptz not null default now(), constraint single_row check (id = 1));
grant select on public.site_settings to anon, authenticated; grant insert, update on public.site_settings to authenticated; grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins manage settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings (id) values (1) on conflict do nothing;

insert into public.brands (name, slug) values
('Audemars Piguet','audemars-piguet'),('Cartier','cartier'),('Casio','casio'),('Curren','curren'),('Hislon','hislon'),('Hublot','hublot'),('Megir','megir'),('Michael Kors','michael-kors'),('Patek Philippe','patek-philippe'),('Poedagar','poedagar'),('Richard Mille','richard-mille'),('Rolex','rolex'),('Tissot','tissot'),('Tommy Hilfiger','tommy-hilfiger')
on conflict (slug) do nothing;

create policy "Public reads watch images" on storage.objects for select using (bucket_id = 'watch-images');
create policy "Admins upload watch images" on storage.objects for insert to authenticated with check (bucket_id = 'watch-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins update watch images" on storage.objects for update to authenticated using (bucket_id = 'watch-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins delete watch images" on storage.objects for delete to authenticated using (bucket_id = 'watch-images' and public.has_role(auth.uid(),'admin'));