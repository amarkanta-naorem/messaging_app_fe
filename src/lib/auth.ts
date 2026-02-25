import { API_BASE } from "./config";
import { parseApiResponse } from "./api";

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  organisation_employees?: {
    status: string;
    joined_at: string;
    role: string;
    organisation: {
      id: number;
      name: string;
      logo: string | null;
      bio: string | null;
    };
  };
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProfileResponse {
  message: string;
  user: User;
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const res = await fetch(`${API_BASE}/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const { data, message } = await parseApiResponse<{ expiresIn: number; otp: string }>(res);
  return {
    message,
    expiresIn: data.expiresIn,
    otp: data.otp,
  };
}

export async function resendOtp(phone: string): Promise<SendOtpResponse> {
  const res = await fetch(`${API_BASE}/auth/otp/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const { data, message } = await parseApiResponse<{ expiresIn: number; otp: string }>(res);
  return {
    message,
    expiresIn: data.expiresIn,
    otp: data.otp,
  };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  const { data, message } = await parseApiResponse<{ token: string; user: User }>(res);
  return { message, token: data.token, user: data.user };
}

export async function getProfile(token?: string | null): Promise<ProfileResponse> {
  const authToken = token ?? getToken();
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const { data, message } = await parseApiResponse<User>(res);
  return { message, user: data };
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const { data, message } = await parseApiResponse<User>(res);
  return { message, user: data };
}

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
