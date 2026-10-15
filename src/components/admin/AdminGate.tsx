import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery } from "@/lib/admin";

const authRoute = getRouteApi("/_authenticated");

export function AdminGate({ children }: { children: ReactNode }) {
  const { user } = authRoute.useRouteContext();
  const { data: isAdmin, isLoading } = useQuery(isAdminQuery());
  const nav = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link to="/admin" className="font-display text-3xl">Catalog admin</Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {user.email}
            <button onClick={signOut} className="text-primary underline">Sign out</button>
          </div>
        </div>
        {isLoading ? <p>Loading…</p> : isAdmin ? children : (
          <div className="rounded-2xl border bg-secondary p-8">
            <h2 className="font-display text-2xl">Waiting for administrator access</h2>
            <p className="mt-2 text-muted-foreground">You're signed in, but this account isn't an administrator yet. Ask Lovable to make {user.email} the administrator.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

