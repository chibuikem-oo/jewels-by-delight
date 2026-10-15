import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts } from "./catalog";

export const isAdminQuery = () =>
  queryOptions({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
  });

export const adminProductsQuery = () =>
  queryOptions({ queryKey: ["products", "admin"], queryFn: () => fetchProducts({ all: true }) });

export const fieldCls = "h-10 w-full rounded-lg border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
