import { describe, expect, it, vi } from "vitest";
import { httpClient } from "./http-client";

describe("httpClient", () => {
  it("does not send content-type for bodyless delete requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ removed: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await httpClient<{ removed: boolean }>("/professionals/professional-1", {
      method: "DELETE",
      skipAuth: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(headers.has("Content-Type")).toBe(false);
  });

  it("sends content-type for json requests with body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ professional: { id: "professional-1" } }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await httpClient<{ professional: { id: string } }>("/professionals", {
      method: "POST",
      body: JSON.stringify({ name: "Ana" }),
      skipAuth: true,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
