/**
 * Centralized error handling.
 * Provides consistent error classes and safe error serialization
 * to prevent leaking internal details to the client.
 */

/**
 * Application-level API error.
 * Used on both client and server to represent API failures.
 */
export class AppError extends Error {
  status: number;
  errors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    status: number,
    errors?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Sanitize an error for client consumption.
 * Strips stack traces and internal details.
 */
export function sanitizeError(error: unknown): { message: string; status: number } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status };
  }

  if (error instanceof Error) {
    // Don't expose raw error messages in production
    const isProduction = process.env.NODE_ENV === "production";
    return {
      message: isProduction ? "An unexpected error occurred" : error.message,
      status: 500,
    };
  }

  return { message: "An unexpected error occurred", status: 500 };
}

/**
 * Extract authorization token from request headers.
 * Returns null if not present.
 */
export function extractBearerToken(
  headers: Headers
): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Create a JSON error response for API routes.
 */
export function errorResponse(
  message: string,
  status: number
): Response {
  return Response.json(
    { success: false, message },
    { status }
  );
}
