/**
 * Theme Provider
 * Handles theme initialization, SSR/CSR hydration, persistence, and system preference monitoring
 * Prevents flash of incorrect theme on page load
 */

"use client";

import { useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  initializeTheme, 
  setSystemPreference,
  selectIsThemeInitialized, 
  selectTheme,
  selectResolvedTheme,
  selectThemeIsDark,
  type Theme 
} from "@/store/slices/themeSlice";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Initializer Component
 * Handles theme initialization after hydration and system preference monitoring
 */
function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsThemeInitialized);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    dispatch(initializeTheme());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemPreference(e.matches ? "dark" : "light"));
    };

    // Add event listener for system theme changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
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
        var theme = localStorage.getItem('theme');
        if (theme) {
          // Parse the persisted theme state
          var parsed = JSON.parse(theme);
          var themeValue = parsed.theme || 'system';
          var resolvedTheme = themeValue;
          
          // Resolve system preference if needed
          if (themeValue === 'system') {
            resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          
          // Apply to document
          document.documentElement.setAttribute('data-theme', resolvedTheme);
          if (resolvedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          // No stored preference, use system preference
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          var systemTheme = prefersDark ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', systemTheme);
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          }
        }
      } catch (e) {
        // Fallback to system preference on error
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        }
      }
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
 * This is the primary API for components to interact with the theme system
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const resolvedTheme = useAppSelector(selectResolvedTheme);
  const isDark = useAppSelector(selectThemeIsDark);
  const isInitialized = useAppSelector(selectIsThemeInitialized);

  const setTheme = (newTheme: Theme) => {
    dispatch({ type: "theme/setTheme", payload: newTheme });
  };

  const toggle = () => {
    dispatch({ type: "theme/toggleTheme" });
  };

  return {
    theme,           // The selected theme ('light', 'dark', or 'system')
    resolvedTheme,   // The actual theme after resolving system preference
    isDark,          // Boolean indicating if dark mode is active
    isInitialized,   // Boolean indicating if theme has been initialized
    setTheme,        // Function to set a specific theme
    toggle,          // Function to toggle between light and dark
  };
}

export default ThemeProvider;
