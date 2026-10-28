// Used only when the catalog can't be reached, so customers can still message
// the shop. Keep in sync with the WhatsApp number saved in admin settings.
export const FALLBACK_WHATSAPP = "2348132846147";
export const FALLBACK_WHATSAPP_LINK = `https://wa.me/${FALLBACK_WHATSAPP}?text=${encodeURIComponent(
  "Hello JewelsByDelight, I'd like to enquire about a watch.",
)}`;
