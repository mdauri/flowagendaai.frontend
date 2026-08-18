import { describe, expect, test, vi } from "vitest";
import { signupService } from "@/services/signup-service";

describe("signupService", () => {
  test("envia signup publico sem Authorization", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        accessToken: "jwt-signup",
        expiresIn: "1d",
        user: { id: "user-1", name: "Ana Silva", email: "ana@studio.com", role: "admin" },
        tenant: { id: "tenant-1", name: "Studio Bella", timezone: "America/Sao_Paulo", slug: "studio-bella" },
        trial: {
          status: "TRIALING",
          startsAt: "2026-08-17T00:00:00.000Z",
          endsAt: "2026-08-31T00:00:00.000Z",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await signupService.signup({
      responsibleName: "Ana Silva",
      email: "ana@studio.com",
      phone: "11999999999",
      cpfCnpj: "12345678000195",
      companyName: "Studio Bella",
      password: "senha-segura",
      acceptedTerms: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(url).toBe("http://localhost:3333/public/signup");
    expect(init.method).toBe("POST");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.has("Authorization")).toBe(false);
    expect(JSON.parse(init.body as string)).toEqual({
      responsibleName: "Ana Silva",
      email: "ana@studio.com",
      phone: "11999999999",
      cpfCnpj: "12345678000195",
      companyName: "Studio Bella",
      password: "senha-segura",
      acceptedTerms: true,
    });
  });
});
