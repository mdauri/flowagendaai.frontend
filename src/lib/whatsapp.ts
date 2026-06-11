const DEFAULT_JAMES_WHATSAPP_PHONE_NUMBER = "5512982828733";

export function buildJamesWhatsAppUrl(message: string): string {
  const url = resolveJamesWhatsAppBaseUrl();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}text=${encodeURIComponent(message)}`;
}

function resolveJamesWhatsAppBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_JAMES_WHATSAPP_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const configuredPhone = import.meta.env.VITE_JAMES_WHATSAPP_PHONE_NUMBER?.trim() || DEFAULT_JAMES_WHATSAPP_PHONE_NUMBER;
  return `https://wa.me/${configuredPhone.replace(/\D/g, "")}`;
}
