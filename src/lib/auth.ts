/**
 * Auth module - wraps the auth service.
 * Kept for backward compatibility - delegates to services.
 *
 * DEPRECATED: Import directly from @/services/auth.service instead.
 * This file is kept for backward compatibility during migration.
 */

import * as authService from "@/services/auth.service";
import type { User, SendOtpResponse, VerifyOtpResponse, ProfileResponse, UpdateProfilePayload } from "@/types";

export type { User, SendOtpResponse, VerifyOtpResponse, ProfileResponse, UpdateProfilePayload };

export const sendOtp = authService.sendOtp;
export const resendOtp = authService.resendOtp;
export const verifyOtp = authService.verifyOtp;
export const getProfile = authService.getProfile;
export const updateProfile = authService.updateProfile;
export const getToken = authService.getToken;
export const setToken = authService.setToken;
export const removeToken = authService.removeToken;
export const getUser = authService.getUser;
export const setUser = authService.setUser;
export const removeUser = authService.removeUser;
