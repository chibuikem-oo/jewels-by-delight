drop policy "Public reads active brands" on public.brands;
create policy "Public reads active brands" on public.brands for select to anon, authenticated using (is_active);
drop policy "Public reads published products" on public.products;
create policy "Public reads published products" on public.products for select to anon, authenticated using (is_published);
drop policy "Public reads images of published products" on public.product_images;
create policy "Public reads images of published products" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.is_published));