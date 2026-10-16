create policy "Public reads published watch images" on storage.objects for select to anon, authenticated
using (bucket_id = 'watch-images' and exists (select 1 from public.product_images i join public.products p on p.id = i.product_id where i.storage_path = storage.objects.name and p.is_published));
create policy "Public reads brand covers" on storage.objects for select to anon, authenticated
using (bucket_id = 'watch-images' and name like 'brands/%/cover-%');
create policy "Admins read watch images" on storage.objects for select to authenticated
using (bucket_id = 'watch-images' and public.has_role(auth.uid(), 'admin'));