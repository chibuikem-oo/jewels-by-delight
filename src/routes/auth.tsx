import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in | JewelsByDelight" },
      { name: "description", content: "Administrator sign in for JewelsByDelight." },
      { property: "og:title", content: "Admin sign in | JewelsByDelight" },
      { property: "og:description", content: "Administrator sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else nav({ to: "/admin" });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
      else nav({ to: "/admin" });
    }
    setBusy(false);
  }

  const field = "h-11 w-full rounded-lg border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <Layout>
      <section className="mx-auto max-w-sm px-6 py-24">
        <h1 className="font-display text-4xl font-medium">{mode === "in" ? "Admin sign in" : "Create admin account"}</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input className={field} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={field} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          <button disabled={busy} className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 text-sm text-primary underline">
          {mode === "in" ? "No account yet? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
    </Layout>
  );
}
