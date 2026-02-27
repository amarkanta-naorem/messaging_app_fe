/**
 * Auth service - client-side.
 * SRP: Handles all authentication-related API calls through BFF.
 * DIP: Depends on api-client abstraction, not direct fetch.
 */

import { post, get, patch } from "./api-client";
import type { User, SendOtpResponse, VerifyOtpResponse, ProfileResponse, UpdateProfilePayload } from "@/types";
import type { ApiEnvelope } from "@/types/api";

// ── OTP ──────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const res = await post<ApiEnvelope<{ expiresIn: number; otp: string }>>(
    "/auth/otp/send",
    { phone }
  );
  return { message: res.message, expiresIn: res.data.expiresIn, otp: res.data.otp };
}

export async function resendOtp(phone: string): Promise<SendOtpResponse> {
  const res = await post<ApiEnvelope<{ expiresIn: number; otp: string }>>(
    "/auth/otp/resend",
    { phone }
  );
  return { message: res.message, expiresIn: res.data.expiresIn, otp: res.data.otp };
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  const res = await post<ApiEnvelope<{ token: string; user: User }>>(
    "/auth/otp/verify",
    { phone, code }
  );
  return { message: res.message, token: res.data.token, user: res.data.user };
}

// ── New Organisation OTP (uses separate codebase endpoints) ───────────────

export async function sendOtpNewOrganisation(phone: string): Promise<SendOtpResponse> {
  const res = await post<ApiEnvelope<{ expiresIn: number; otp: string }>>(
    "/otp/send",
    { phone }
  );
  return { message: res.message, expiresIn: res.data.expiresIn, otp: res.data.otp };
}

export async function resendOtpNewOrganisation(phone: string): Promise<SendOtpResponse> {
  const res = await post<ApiEnvelope<{ expiresIn: number; otp: string }>>(
    "/otp/resend",
    { phone }
  );
  return { message: res.message, expiresIn: res.data.expiresIn, otp: res.data.otp };
}

export async function verifyOtpNewOrganisation(phone: string, code: string): Promise<VerifyOtpResponse> {
  const res = await post<ApiEnvelope<{ token: string; user: User }>>(
    "/otp/verify",
    { phone, code }
  );
  return { message: res.message, token: res.data.token, user: res.data.user };
}

// ── Profile ──────────────────────────────────────────────────────────

export async function getProfile(): Promise<ProfileResponse> {
  const res = await get<ApiEnvelope<User>>("/auth/profile");
  return { message: res.message, user: res.data };
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
  const res = await patch<ApiEnvelope<User>>("/auth/profile", payload);
  return { message: res.message, user: res.data };
}

// ── Token management (client-side storage) ───────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("auth_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
}

export function setUser(user: User): void {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem("auth_user");
}
