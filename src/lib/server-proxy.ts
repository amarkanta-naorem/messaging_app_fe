/**
 * Server-side proxy utility for BFF (Backend-For-Frontend) pattern.
 * All external API calls are routed through Next.js API routes,
 * keeping the real API_BASE_URL hidden from the browser.
 */

import { API_BASE_URL } from "./server-config";
import { extractBearerToken, errorResponse } from "./errors";

interface ProxyOptions {
  /** The external API path (appended to API_BASE_URL) */
  path: string;
  /** HTTP method */
  method?: string;
  /** The incoming Next.js request (to extract auth headers) */
  request: Request;
  /** Optional request body (will be JSON-stringified) */
  body?: unknown;
  /** Optional query string to append */
  query?: string;
}

/**
 * Proxy a request to the external API.
 * Forwards the Authorization header from the client request.
 * Returns the external API response as-is (preserving status codes).
 */
export async function proxyRequest({
  path,
  method = "GET",
  request,
  body,
  query,
}: ProxyOptions): Promise<Response> {
  const token = extractBearerToken(request.headers);

  if (!token) {
    return errorResponse("Authentication required", 401);
  }

  const url = `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch {
    return errorResponse("Service unavailable", 502);
  }
}

/**
 * Proxy a request that doesn't require authentication (e.g., login/OTP).
 */
export async function proxyPublicRequest({
  path,
  method = "POST",
  body,
}: {
  path: string;
  method?: string;
  body?: unknown;
}): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch {
    return errorResponse("Service unavailable", 502);
  }
}
