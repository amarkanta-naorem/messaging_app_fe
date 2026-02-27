/**
 * useInviteGuard Hook
 * Protects routes that require invite verification
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectIsVerified, resetInvite } from "../slices/inviteSlice";

interface UseInviteGuardOptions {
  redirectTo?: string;
  enabled?: boolean;
}

/**
 * Hook to protect routes that require invite verification
 * @param options - Configuration options
 * @param options.redirectTo - URL to redirect to if not verified (default: /verify-invite)
 * @param options.enabled - Whether the guard is active (default: true)
 */
export function useInviteGuard(options: UseInviteGuardOptions = {}) {
  const { redirectTo = "/verify-invite", enabled = true } = options;
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isVerified = useAppSelector((state: any) => state.invite?.isVerified ?? false);

  useEffect(() => {
    if (!enabled) return;
    
    if (!isVerified) {
      router.replace(redirectTo);
    }
  }, [isVerified, enabled, redirectTo, router]);

  return {
    isVerified,
    reset: () => dispatch(resetInvite()),
  };
}

export default useInviteGuard;
