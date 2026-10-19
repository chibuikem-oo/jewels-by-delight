import { useHydrated } from "@tanstack/react-router";

// The site address is only known in the browser, so links built from it appear
// after hydration — server and first browser render stay identical.
export function useSiteOrigin(): string | null {
  return useHydrated() && typeof window !== "undefined" ? window.location.origin : null;
}
