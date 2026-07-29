import { describe, expect, it } from "vitest";
import {
  CUSTOMER_APP_SCOPE_ROOT,
  buildCustomerAppManifest,
  buildCustomerAppScopedPath,
  isCustomerAppPath,
  matchCustomerAppTenantSlug,
  resolveCustomerAppNotificationTarget,
} from "./customer-app-pwa";

describe("customer-app-pwa helpers", () => {
  it("matches a tenant slug only for customer app paths", () => {
    expect(matchCustomerAppTenantSlug("/c/test-studio")).toBe("test-studio");
    expect(matchCustomerAppTenantSlug("/c/test-studio/bookings/booking-1")).toBe("test-studio");
    expect(matchCustomerAppTenantSlug("/")).toBeNull();
    expect(matchCustomerAppTenantSlug("/app/dashboard")).toBeNull();
  });

  it("identifies customer app paths", () => {
    expect(isCustomerAppPath("/c/test-studio")).toBe(true);
    expect(isCustomerAppPath("/c/test-studio/catalog")).toBe(true);
    expect(isCustomerAppPath("/manage/token-1")).toBe(false);
  });

  it("builds a tenant scoped manifest", () => {
    const manifest = buildCustomerAppManifest("barbearia julio");

    expect(manifest.start_url).toBe("/c/barbearia%20julio");
    expect(manifest.scope).toBe(CUSTOMER_APP_SCOPE_ROOT);
    expect(buildCustomerAppScopedPath("barbearia julio")).toBe(CUSTOMER_APP_SCOPE_ROOT);
  });

  it("accepts a valid customer app notification target", () => {
    const result = resolveCustomerAppNotificationTarget({
      rawUrl: "/c/test-studio/bookings/booking-1",
      origin: "https://agendoro.test",
      registrationScope: "https://agendoro.test/c/test-studio/",
      clientUrls: [],
    });

    expect(result).toEqual({
      targetUrl: "/c/test-studio/bookings/booking-1",
      tenantSlug: "test-studio",
      fallbackUsed: false,
      rejectedReason: null,
    });
  });

  it("rejects external and admin targets and falls back to the tenant home", () => {
    const result = resolveCustomerAppNotificationTarget({
      rawUrl: "https://evil.example/app",
      origin: "https://agendoro.test",
      registrationScope: "https://agendoro.test/c/test-studio/",
      clientUrls: [],
    });

    expect(result).toEqual({
      targetUrl: "/c/test-studio",
      tenantSlug: "test-studio",
      fallbackUsed: true,
      rejectedReason: "invalid_or_missing_target",
    });
  });

  it("falls back to an existing client when the payload has no safe tenant target", () => {
    const result = resolveCustomerAppNotificationTarget({
      rawUrl: null,
      origin: "https://agendoro.test",
      registrationScope: null,
      clientUrls: [
        "https://agendoro.test/app/dashboard",
        "https://agendoro.test/c/test-studio/catalog",
      ],
    });

    expect(result).toEqual({
      targetUrl: "/c/test-studio",
      tenantSlug: "test-studio",
      fallbackUsed: true,
      rejectedReason: "invalid_or_missing_target",
    });
  });

  it("returns no target when neither payload nor clients provide a safe tenant path", () => {
    const result = resolveCustomerAppNotificationTarget({
      rawUrl: "/",
      origin: "https://agendoro.test",
      registrationScope: null,
      clientUrls: ["https://agendoro.test/app/dashboard"],
    });

    expect(result).toEqual({
      targetUrl: null,
      tenantSlug: null,
      fallbackUsed: false,
      rejectedReason: "missing_safe_fallback",
    });
  });
});
