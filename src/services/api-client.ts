/**
 * Client-side API client.
 * All requests go through Next.js API routes (BFF pattern).
 * The external API URL is never exposed to the browser.
 *
 * DIP: Components depend on this abstraction, not on direct fetch calls.
 * SRP: This module's sole responsibility is HTTP communication with the BFF.
 */

import { AppError } from "@/lib/errors";

/**
 * Get the auth token from localStorage.
 * Kept here as a thin utility; the token is still stored client-side
 * for WebSocket auth and request headers.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Build standard headers for authenticated requests.
 */
function buildHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authToken = token ?? getToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

/**
 * Generic fetch wrapper that targets our BFF API routes.
 * Throws AppError on non-OK responses.
 * Includes timeout to prevent hanging requests.
 */
async function _request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${path}`;

  // Add timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...buildHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String(data.message)
          : "Request failed";
      throw new AppError(message, response.status, data?.errors);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Handle abort errors specifically
    if (error.name === 'AbortError') {
      throw new AppError("Request timed out", 408);
    }
    throw error;
  }
}

/**
 * GET request through BFF.
 */
export function get<T>(path: string): Promise<T> {
  return _request<T>(path, { method: "GET" });
}

/**
 * POST request through BFF.
 */
export function post<T>(path: string, body?: unknown): Promise<T> {
  return _request<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request through BFF.
 */
export function patch<T>(path: string, body?: unknown): Promise<T> {
  return _request<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request through BFF.
 */
export function del<T>(path: string): Promise<T> {
  return _request<T>(path, { method: "DELETE" });
}
