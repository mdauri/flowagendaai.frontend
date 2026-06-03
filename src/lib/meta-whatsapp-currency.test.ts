import { describe, expect, it } from "vitest";
import {
  formatMetaWhatsAppCurrency,
  META_WHATSAPP_BILLING_CURRENCY,
  normalizeMetaWhatsAppCurrency,
} from "@/lib/meta-whatsapp-currency";

describe("meta-whatsapp-currency", () => {
  it("normaliza US para USD", () => {
    expect(normalizeMetaWhatsAppCurrency("US")).toBe(META_WHATSAPP_BILLING_CURRENCY);
    expect(normalizeMetaWhatsAppCurrency("usd")).toBe(META_WHATSAPP_BILLING_CURRENCY);
  });

  it("usa USD como fallback para moeda inválida", () => {
    expect(normalizeMetaWhatsAppCurrency("BRL")).toBe(META_WHATSAPP_BILLING_CURRENCY);
    expect(formatMetaWhatsAppCurrency("12.5", "US")).toMatch(/US\$\s?12,5000/);
    expect(() => formatMetaWhatsAppCurrency("12.5", "US")).not.toThrow();
  });
});
