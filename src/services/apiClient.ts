/**
 * Thin API client. Today every call is served locally from the mock adapter so
 * the prototype runs without a backend. Set VITE_API_BASE_URL to point the same
 * calls at the Spring Boot service (Cloud Run) — no UI change required.
 */
export const API_BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "";

export const useRemoteApi = Boolean(API_BASE_URL);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  init?: RequestInit & { body?: unknown },
): Promise<T> {
  if (!useRemoteApi) {
    throw new ApiError("No API base URL configured; using local mock adapter.");
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) {
    throw new ApiError("We couldn't reach the planning service.", res.status);
  }
  return (await res.json()) as T;
}

/** Simulated latency so loading states are real, not decorative. */
export function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
