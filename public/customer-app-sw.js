self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {
    title: "Agendoro",
    body: "Voce tem uma atualizacao no app do cliente.",
    url: "/",
    tag: "agendoro-customer-app",
  };

  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
      tag: payload.tag,
      icon: "/agendoro-logo.png",
      badge: "/agendoro-logo.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const clientUrls = clients.map((client) => client.url);
      const resolvedTarget = resolveCustomerAppNotificationTarget({
        rawUrl: event.notification.data?.url,
        registrationScope: self.registration.scope,
        clientUrls,
      });

      if (!resolvedTarget.targetUrl) {
        console.warn("customer_app_notification_target_rejected", {
          reason: resolvedTarget.rejectedReason,
        });
        return undefined;
      }

      if (resolvedTarget.fallbackUsed) {
        console.info("customer_app_notification_fallback_used", {
          tenantSlug: resolvedTarget.tenantSlug,
        });
      }

      const exactClient = clients.find((client) => normalizeClientUrl(client.url) === resolvedTarget.targetUrl);

      if (exactClient && "focus" in exactClient) {
        return exactClient.focus();
      }

      const sameTenantClient = clients.find((client) => {
        return matchCustomerAppTenantSlugFromPath(new URL(client.url).pathname) === resolvedTarget.tenantSlug;
      });

      if (sameTenantClient && "navigate" in sameTenantClient && "focus" in sameTenantClient) {
        return sameTenantClient.navigate(resolvedTarget.targetUrl).then(() => sameTenantClient.focus());
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(resolvedTarget.targetUrl);
      }

      console.warn("customer_app_notification_navigation_failed", {
        reason: "open_window_unavailable",
        tenantSlug: resolvedTarget.tenantSlug,
      });
      return undefined;
    }),
  );
});

function resolveCustomerAppNotificationTarget(input) {
  const validTarget = normalizeCustomerAppTarget(input.rawUrl);

  if (validTarget) {
    return {
      targetUrl: validTarget.targetUrl,
      tenantSlug: validTarget.tenantSlug,
      fallbackUsed: false,
      rejectedReason: null,
    };
  }

  const fallbackTarget = resolveCustomerAppFallbackTarget(input);

  if (fallbackTarget) {
    return {
      targetUrl: fallbackTarget.targetUrl,
      tenantSlug: fallbackTarget.tenantSlug,
      fallbackUsed: true,
      rejectedReason: "invalid_or_missing_target",
    };
  }

  return {
    targetUrl: null,
    tenantSlug: null,
    fallbackUsed: false,
    rejectedReason: "missing_safe_fallback",
  };
}

function normalizeCustomerAppTarget(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();

  if (!trimmed || trimmed.indexOf("javascript:") === 0) {
    return null;
  }

  let url;

  try {
    url = new URL(trimmed, self.location.origin);
  } catch {
    return null;
  }

  if (url.origin !== self.location.origin) {
    return null;
  }

  const tenantSlug = matchCustomerAppTenantSlugFromPath(url.pathname);

  if (!tenantSlug) {
    return null;
  }

  return {
    targetUrl: normalizeClientUrl(url.toString()),
    tenantSlug,
  };
}

function resolveCustomerAppFallbackTarget(input) {
  const registrationScopeTarget = normalizeCustomerAppTarget(input.registrationScope);

  if (registrationScopeTarget) {
    return {
      targetUrl: "/c/" + encodeURIComponent(registrationScopeTarget.tenantSlug),
      tenantSlug: registrationScopeTarget.tenantSlug,
    };
  }

  for (const clientUrl of input.clientUrls || []) {
    const clientTarget = normalizeCustomerAppTarget(clientUrl);

    if (clientTarget) {
      return {
        targetUrl: "/c/" + encodeURIComponent(clientTarget.tenantSlug),
        tenantSlug: clientTarget.tenantSlug,
      };
    }
  }

  return null;
}

function matchCustomerAppTenantSlugFromPath(pathname) {
  const match = pathname.match(/^\/c\/([^/]+)(?:\/|$)/);

  if (!match || !match[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

function normalizeClientUrl(value) {
  const url = new URL(value, self.location.origin);

  return url.pathname + url.search + url.hash;
}
