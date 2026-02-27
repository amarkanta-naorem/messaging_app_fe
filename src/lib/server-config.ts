/**
 * Server-side only configuration.
 * This file should NEVER be imported from client components.
 * The API_BASE_URL is kept server-side to prevent exposure in the browser.
 */

// Server-side environment variable (not prefixed with NEXT_PUBLIC_)
// Falls back to localhost for development
export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

// Socket URL - points to the backend WebSocket server
// This should be the backend API server, not the frontend
export const SOCKET_URL =
  process.env.SOCKET_URL ||
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  API_BASE_URL.replace("/api", "");
