import { AppError } from "@/lib/errors";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function buildHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const authToken = token ?? getToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function _request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `/api${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      const message = data && typeof data === "object" && "message" in data ? String(data.message) : "Request failed";
      throw new AppError(message, response.status, data?.errors);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new AppError("Request timed out", 408);
    }
    throw error;
  }
}

export async function requestWithToast<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    return await _request<T>(path, options);
  } catch (error: any) {
    const { store } = await import("@/store/index");
    const { setGlobalError } = await import("@/store/slices/errorSlice");
    
    if (error instanceof AppError) {
      store.dispatch(setGlobalError({ message: error.message, type: 'error' }));
    } else {
      store.dispatch(setGlobalError({ message: error?.message || "An unexpected error occurred", type: 'error' }));
    }
    return null;
  }
}

export function get<T>(path: string): Promise<T> {
  return _request<T>(path, { method: "GET" });
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return _request<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return _request<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function patchFormData<T>(path: string, formData: FormData): Promise<T> {
  const url = `/api${path}`;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    return fetch(url, { method: "PATCH", body: formData, headers, signal: controller.signal }).then(async (response) => {
      clearTimeout(timeoutId);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data && typeof data === "object" && "message" in data ? String(data.message) : "Request failed";
        throw new AppError(message, response.status, data?.errors);
      }

      return data as T;
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new AppError("Request timed out", 408);
    }
    throw error;
  }
}

export function del<T>(path: string): Promise<T> {
  return _request<T>(path, { method: "DELETE" });
}
