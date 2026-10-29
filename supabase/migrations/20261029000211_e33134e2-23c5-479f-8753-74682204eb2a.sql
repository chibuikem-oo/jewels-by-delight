create policy "Public reads published watch thumbnails" on storage.objects for select to anon, authenticated
using (bucket_id = 'watch-images' and name like '%.thumb.jpg' and exists (
  select 1 from public.product_images i join public.products p on p.id = i.product_id
  where i.storage_path || '.thumb.jpg' = storage.objects.name and p.is_published
));