import { describe, expect, it } from "vitest";
import { fitWithin, MAX_PHOTO_SIDE } from "@/lib/image-compress";
import { FALLBACK_WHATSAPP_LINK } from "@/lib/contact-fallback";

describe("Uploaded photo size", () => {
  it("shrinks a large phone photo so its longest side is 1400px", () => {
    expect(MAX_PHOTO_SIDE).toBe(1400);
    expect(fitWithin(4000, 3000)).toEqual({ width: 1400, height: 1050 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1050, height: 1400 });
  });

  it("never enlarges a photo that is already small", () => {
    expect(fitWithin(800, 1000)).toEqual({ width: 800, height: 1000 });
  });
});

describe("Outage page", () => {
  it("still lets customers message the shop's WhatsApp number", () => {
    expect(FALLBACK_WHATSAPP_LINK.startsWith("https://wa.me/2348132846147")).toBe(true);
  });
});
