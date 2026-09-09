import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, test, vi } from "vitest";
import type { ReactNode } from "react";
import { usePublicSignupMutation } from "./use-public-signup-mutation";
import { signupService } from "@/services/signup-service";
import { acquisitionService } from "@/services/acquisition-service";

vi.mock("@/services/signup-service", () => ({ signupService: { signup: vi.fn() } }));
vi.mock("@/services/acquisition-service", () => ({ acquisitionService: { recordSignupAttribution: vi.fn() } }));
vi.mock("@/session/session-storage", () => ({ setStoredToken: vi.fn() }));
vi.mock("@/lib/first-party-analytics", () => ({ trackFirstPartyEvent: vi.fn() }));
vi.mock("@/lib/acquisition-attribution", () => ({ getAcquisitionAttribution: () => ({ source: "outbound", prospectId: "49d52765-1f72-4bdf-9015-4bdf7bbfa8de" }) }));

test("successful signup remains successful if attribution fails", async () => {
  const result = { accessToken: "test-token", tenant: { id: "test-tenant" } };
  vi.mocked(signupService.signup).mockResolvedValue(result as Awaited<ReturnType<typeof signupService.signup>>);
  vi.mocked(acquisitionService.recordSignupAttribution).mockRejectedValue(new Error("analytics unavailable"));
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const { result: hook } = renderHook(() => usePublicSignupMutation(), { wrapper });
  await act(async () => {
    const output = await hook.current.mutateAsync({ responsibleName: "Teste", email: "test@example.invalid", phone: "11000000000", cpfCnpj: "52998224725", companyName: "Teste", password: "test-only-password", acceptedTerms: true });
    expect(output).toBe(result);
  });
  expect(acquisitionService.recordSignupAttribution).toHaveBeenCalledWith(expect.objectContaining({ prospectId: "49d52765-1f72-4bdf-9015-4bdf7bbfa8de" }));
});
