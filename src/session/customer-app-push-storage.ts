function storageKey(tenantSlug: string) {
  return `agendoro.customer-app-push.${tenantSlug}`;
}

export interface StoredCustomerAppPushSubscription {
  subscriptionId: string;
  endpoint: string;
}

export function getStoredCustomerAppPushSubscription(
  tenantSlug: string,
): StoredCustomerAppPushSubscription | null {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.getItem !== "function"
  ) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(tenantSlug));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredCustomerAppPushSubscription;
  } catch {
    window.localStorage.removeItem(storageKey(tenantSlug));
    return null;
  }
}

export function setStoredCustomerAppPushSubscription(
  tenantSlug: string,
  subscription: StoredCustomerAppPushSubscription,
) {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.setItem !== "function"
  ) {
    return;
  }

  window.localStorage.setItem(storageKey(tenantSlug), JSON.stringify(subscription));
}

export function clearStoredCustomerAppPushSubscription(tenantSlug: string) {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.removeItem !== "function"
  ) {
    return;
  }

  window.localStorage.removeItem(storageKey(tenantSlug));
}
