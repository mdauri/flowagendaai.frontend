import { ApiError, type ApiErrorResponse } from "@/types/api";
import { getStoredToken } from "@/session/session-storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (!options.skipAuth) {
    const token = getStoredToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let payload: ApiErrorResponse | null = null;

    try {
      payload = (await response.json()) as ApiErrorResponse;
    } catch {
      payload = null;
    }

    throw new ApiError(
      response.status,
      payload?.code ?? "HTTP_ERROR",
      payload?.message ?? "Nao foi possivel concluir a requisicao.",
      payload?.requestId ?? "unknown",
      payload?.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
