/**
 * Common API response types.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
}
