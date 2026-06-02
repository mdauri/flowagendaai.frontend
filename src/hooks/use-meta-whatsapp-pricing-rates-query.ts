import { useQuery } from "@tanstack/react-query";
import { metaWhatsAppBillingService } from "@/services/meta-whatsapp-billing-service";

export function getMetaWhatsAppPricingRatesQueryKey(input: {
  scope: "system-admin" | "tenant";
  countryCode?: string;
  messageCategory?: string;
}) {
  return ["meta-whatsapp-pricing-rates", input.scope, input.countryCode ?? null, input.messageCategory ?? null] as const;
}

export function useMetaWhatsAppPricingRatesQuery(input: {
  scope: "system-admin" | "tenant";
  countryCode?: string;
  messageCategory?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: getMetaWhatsAppPricingRatesQueryKey(input),
    queryFn: () => metaWhatsAppBillingService.getPricingRates(input),
    enabled: input.enabled ?? input.scope === "system-admin",
    retry: false,
  });
}
