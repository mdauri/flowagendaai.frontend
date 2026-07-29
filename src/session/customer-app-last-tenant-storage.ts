const STORAGE_KEY = "agendoro.customer-app-last-tenant";

export function getLastCustomerAppTenantSlug(): string | null {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.getItem !== "function"
  ) {
    return null;
  }

  const tenantSlug = window.localStorage.getItem(STORAGE_KEY)?.trim();

  return tenantSlug ? tenantSlug : null;
}

export function setLastCustomerAppTenantSlug(tenantSlug: string) {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.setItem !== "function"
  ) {
    return;
  }

  const normalized = tenantSlug.trim();

  if (!normalized) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, normalized);
}
