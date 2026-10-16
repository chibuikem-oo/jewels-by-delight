import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { settingsQuery, whatsappLink } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WhatsAppButton({
  message,
  label = "Chat with us on WhatsApp",
  variant = "solid",
  className,
}: {
  message?: string;
  label?: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const { data } = useQuery(settingsQuery());
  const href = whatsappLink(data?.whatsapp_number ?? null, message);
  const base = cn(
    "inline-flex h-auto min-h-11 max-w-full items-center justify-center gap-2 whitespace-normal rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] transition-transform [&_svg]:shrink-0",
    variant === "solid"
      ? "bg-primary text-primary-foreground hover:scale-[1.03]"
      : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    className,
  );
  if (!href) {
    return (
      <span className={cn(base, "cursor-not-allowed opacity-60 hover:scale-100")} title="WhatsApp coming soon">
        <MessageCircle className="h-4 w-4" /> WhatsApp coming soon
      </span>
    );
  }
  return (
    <Button asChild variant={variant === "solid" ? "default" : "outline"} className={base}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" /> {label}
      </a>
    </Button>
  );
}
