import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | JewelsByDelight" },
      { name: "description", content: "Contact JewelsByDelight on WhatsApp for wristwatch enquiries, availability and ordering information." },
      { property: "og:title", content: "Contact JewelsByDelight on WhatsApp" },
      { property: "og:description", content: "Let's find your next timepiece." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(settingsQuery()).then(() => null),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Contact</p>
        <h1 className="mt-3 text-balance font-display text-4xl font-medium sm:text-6xl">Let's Find Your Next Timepiece</h1>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
          Seen a watch you love? Contact JewelsByDelight directly on WhatsApp for product enquiries, availability and ordering information.
        </p>
        <div className="mt-10"><WhatsAppButton /></div>
        <p className="mx-auto mt-10 max-w-md text-sm leading-relaxed text-muted-foreground">
          Have a particular brand or model in mind? Send us an enquiry, and we'll help you find the watch you're looking for.
        </p>
      </section>
    </Layout>
  );
}
