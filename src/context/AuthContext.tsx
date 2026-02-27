/**
 * Auth Context
 * Uses Redux for state management with proper session handling
 */

"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { 
  initializeAuth, 
  loginUser, 
  logoutUser,
  clearAuthState,
  selectIsAuthenticated,
  selectUser,
  selectToken,
  selectIsAuthLoading,
  selectIsAuthInitialized,
} from "@/store/store";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Don't initialize here - HydrationHandler in provider already handles this
    // This prevents duplicate async calls that can cause loading states
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await (dispatch as any)(loginUser({ user: newUser, token: newToken }));
  };

  const logout = async () => {
    // This will trigger the middleware to clear all state
    await (dispatch as any)(logoutUser());
    // Force a page reload to ensure complete state reset
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isLoading, 
        isInitialized,
        isAuthenticated,
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
