/**
 * Theme Provider
 * Handles theme initialization, SSR/CSR hydration, and persistence
 * Prevents flash of incorrect theme on page load
 */

"use client";

import { useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeTheme, selectIsThemeInitialized, toggleTheme, type Theme } from "@/store/slices/themeSlice";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Initializer Component
 * Handles theme initialization after hydration
 */
function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsThemeInitialized);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    dispatch(initializeTheme());
  }, [dispatch]);

  return null;
}

/**
 * Main Theme Provider Component
 * Wraps the application to provide theme context
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Apply theme to document before first paint to prevent flash
  // This uses a script in the head for maximum performance
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('app-theme');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch (e) {}
    })();
  `;

  return (
    <>
      {/* Inline script to prevent flash of incorrect theme */}
      <script
        dangerouslySetInnerHTML={{ __html: themeScript }}
        suppressHydrationWarning
      />
      <ThemeInitializer />
      {children}
    </>
  );
}

/**
 * Hook to access theme functionality
 * Provides theme state and toggle methods
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const isDark = theme === "dark";
  const isInitialized = useAppSelector(selectIsThemeInitialized);

  const setTheme = (newTheme: Theme) => {
    dispatch({ type: "theme/setTheme", payload: newTheme });
  };

  const toggle = () => {
    dispatch(toggleTheme());
  };

  return {
    theme,
    isDark,
    isInitialized,
    setTheme,
    toggle,
  };
}

export default ThemeProvider;
