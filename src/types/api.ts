/**
 * Common API response types.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors?: Array<{ field: string; message: string }>;
  suggestion?: string;
}
