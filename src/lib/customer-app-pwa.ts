const CUSTOMER_APP_BASE_SEGMENT = "/c/";

export interface CustomerAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone";
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export const CUSTOMER_APP_SCOPE_ROOT = "/c";

export interface ResolvedCustomerAppTarget {
  targetUrl: string | null;
  tenantSlug: string | null;
  fallbackUsed: boolean;
  rejectedReason: string | null;
}

export function matchCustomerAppTenantSlug(pathname: string): string | null {
  const match = pathname.match(/^\/c\/([^/]+)(?:\/|$)/);

  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

export function isCustomerAppPath(pathname: string): boolean {
  return matchCustomerAppTenantSlug(pathname) !== null;
}

export function buildCustomerAppBasePath(tenantSlug: string): string {
  return `${CUSTOMER_APP_BASE_SEGMENT}${encodeURIComponent(tenantSlug)}`;
}

export function buildCustomerAppScopedPath(tenantSlug: string): string {
  return CUSTOMER_APP_SCOPE_ROOT;
}

export function buildCustomerAppManifest(tenantSlug: string): CustomerAppManifest {
  const basePath = buildCustomerAppBasePath(tenantSlug);

  return {
    name: "Agendoro",
    short_name: "Agendoro",
    description: "App do cliente do Agendoro para acompanhar compromissos e receber lembretes.",
    start_url: basePath,
    scope: CUSTOMER_APP_SCOPE_ROOT,
    display: "standalone",
    background_color: "#fff7ed",
    theme_color: "#f59e0b",
    icons: [
      {
        src: "/agendoro-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/agendoro-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

export function resolveCustomerAppNotificationTarget(input: {
  rawUrl: string | null | undefined;
  origin: string;
  registrationScope?: string | null;
  clientUrls?: string[];
}): ResolvedCustomerAppTarget {
  const validTarget = normalizeCustomerAppTarget(input.rawUrl, input.origin);

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

function normalizeCustomerAppTarget(
  rawUrl: string | null | undefined,
  origin: string,
): { targetUrl: string; tenantSlug: string } | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();

  if (!trimmed || trimmed.startsWith("javascript:")) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed, origin);
  } catch {
    return null;
  }

  if (url.origin !== origin) {
    return null;
  }

  const tenantSlug = matchCustomerAppTenantSlug(url.pathname);

  if (!tenantSlug) {
    return null;
  }

  return {
    targetUrl: `${url.pathname}${url.search}${url.hash}`,
    tenantSlug,
  };
}

function resolveCustomerAppFallbackTarget(input: {
  origin: string;
  registrationScope?: string | null;
  clientUrls?: string[];
}): { targetUrl: string; tenantSlug: string } | null {
  const registrationScopeMatch = normalizeCustomerAppTarget(
    input.registrationScope ?? null,
    input.origin,
  );

  if (registrationScopeMatch) {
    return {
      targetUrl: buildCustomerAppBasePath(registrationScopeMatch.tenantSlug),
      tenantSlug: registrationScopeMatch.tenantSlug,
    };
  }

  for (const clientUrl of input.clientUrls ?? []) {
    const clientMatch = normalizeCustomerAppTarget(clientUrl, input.origin);

    if (clientMatch) {
      return {
        targetUrl: buildCustomerAppBasePath(clientMatch.tenantSlug),
        tenantSlug: clientMatch.tenantSlug,
      };
    }
  }

  return null;
}
