"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if invite is verified in Redux store
    const state = store.getState() as any;
    const isVerified = state.invite?.isVerified ?? false;

    if (!isVerified) {
      router.replace("/verify-invite");
    } else {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [router]);

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-violet-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render children (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
