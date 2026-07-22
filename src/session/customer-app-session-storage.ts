function storageKey(tenantSlug: string) {
  return `agendoro.customer-app-session.${tenantSlug}`;
}

export interface StoredCustomerAppSession {
  token: string;
  expiresAt: string;
  customerName?: string | null;
}

export function getCustomerAppSession(tenantSlug: string): StoredCustomerAppSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(tenantSlug));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredCustomerAppSession;
  } catch {
    window.localStorage.removeItem(storageKey(tenantSlug));
    return null;
  }
}

export function setCustomerAppSession(
  tenantSlug: string,
  session: StoredCustomerAppSession,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey(tenantSlug), JSON.stringify(session));
}

export function clearCustomerAppSession(tenantSlug: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey(tenantSlug));
}
