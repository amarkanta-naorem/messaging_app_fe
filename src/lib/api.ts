export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function parseApiResponse<T>(res: Response): Promise<{ message: string; data: T }> {
  let payload: ApiEnvelope<T> | T | null = null;

  try {
    payload = (await res.json()) as ApiEnvelope<T> | T;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload && typeof payload === "object" && "message" in payload ? String((payload as ApiEnvelope<T>).message) : "Request failed";
    throw new ApiRequestError(message, res.status);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    return { message: envelope.message, data: envelope.data };
  }

  return { message: "", data: payload as T };
}
