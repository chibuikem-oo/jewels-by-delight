CREATE OR REPLACE FUNCTION public.set_watch_brand_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  SELECT b.name INTO NEW.name FROM public.brands b WHERE b.id = NEW.brand_id;
  IF NEW.name IS NULL THEN
    RAISE EXCEPTION 'Choose an existing brand for this watch';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_watch_brand_name() FROM PUBLIC;
CREATE TRIGGER enforce_watch_brand_name
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_watch_brand_name();
UPDATE public.products p SET name = b.name FROM public.brands b
WHERE p.brand_id = b.id AND p.name IS DISTINCT FROM b.name;