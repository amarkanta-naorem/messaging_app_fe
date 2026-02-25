/**
 * Auth-related type definitions.
 * Shared across client and server boundaries.
 */

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

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}
