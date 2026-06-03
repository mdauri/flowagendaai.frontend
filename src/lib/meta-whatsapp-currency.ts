export const META_WHATSAPP_BILLING_CURRENCY = "USD";

export const META_WHATSAPP_BILLING_CURRENCY_OPTIONS = [
  { value: META_WHATSAPP_BILLING_CURRENCY, label: "USD - Dólar americano" },
];

export function normalizeMetaWhatsAppCurrency(currency?: string | null): string {
  const normalized = currency?.trim().toUpperCase();

  if (normalized === "US" || normalized === META_WHATSAPP_BILLING_CURRENCY) {
    return META_WHATSAPP_BILLING_CURRENCY;
  }

  return META_WHATSAPP_BILLING_CURRENCY;
}

export function formatMetaWhatsAppCurrency(value: string | number | null | undefined, currency?: string | null) {
  const numeric = typeof value === "string" ? Number(value) : (value ?? 0);
  const safeCurrency = normalizeMetaWhatsAppCurrency(currency);

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(Number.isFinite(numeric) ? numeric : 0);
  } catch {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: META_WHATSAPP_BILLING_CURRENCY,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(Number.isFinite(numeric) ? numeric : 0);
  }
}
