/**
 * Redux Provider with Persist Gate
 * Handles SSR/CSR hydration correctly
 */

"use client";

import { useEffect, useRef, ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./index";
import { initializeAuth } from "./slices/authSlice";
import { clearAllChatState } from "./slices/chatSlice";

// ── Loading Component ───────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// ── Hydration Handler ─────────────────────────────────────────────────

function HydrationHandler() {
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      
      // Initialize auth on mount
      (store.dispatch as any)(initializeAuth());
      
      // Clear any stale chat state on app load
      // This prevents stale data from previous sessions
      (store.dispatch as any)(clearAllChatState());
    }
  }, []);

  return null;
}

// ── Main Provider ────────────────────────────────────────────────────

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <HydrationHandler />
        {children}
      </PersistGate>
    </Provider>
  );
}

export default ReduxProvider;
