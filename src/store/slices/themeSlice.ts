/**
 * Theme Slice - Redux Toolkit
 * Manages global theme state (light/dark mode)
 * Supports SSR/CSR with proper hydration and persistence
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Types ───────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark";

export interface ThemeState {
  theme: Theme;
  isInitialized: boolean;
}

// ── Initial State ────────────────────────────────────────────────────────

const initialState: ThemeState = {
  theme: "light",
  isInitialized: false,
};

// ── Slice ────────────────────────────────────────────────────────────────

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    /**
     * Set theme - handles all theme transitions
     */
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.isInitialized = true;
      
      // Persist to localStorage (client-side only)
      if (typeof window !== "undefined") {
        localStorage.setItem("app-theme", action.payload);
        
        // Apply theme to document root for CSS variables
        document.documentElement.setAttribute("data-theme", action.payload);
        
        // Toggle dark class for Tailwind
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    
    /**
     * Toggle between light and dark theme
     */
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      state.isInitialized = true;
      
      // Persist to localStorage (client-side only)
      if (typeof window !== "undefined") {
        localStorage.setItem("app-theme", newTheme);
        
        // Apply theme to document root
        document.documentElement.setAttribute("data-theme", newTheme);
        
        // Toggle dark class for Tailwind
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    
    /**
     * Initialize theme from storage or system preference
     * Called after hydration to avoid mismatch
     */
    initializeTheme: (state) => {
      if (typeof window === "undefined") return;
      
      // Check localStorage first
      const stored = localStorage.getItem("app-theme") as Theme | null;
      
      if (stored && (stored === "light" || stored === "dark")) {
        state.theme = stored;
        state.isInitialized = true;
        
        // Apply to document
        document.documentElement.setAttribute("data-theme", stored);
        if (stored === "dark") {
          document.documentElement.classList.add("dark");
        }
      } else {
        // Fallback to system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        state.theme = prefersDark ? "dark" : "light";
        state.isInitialized = true;
        
        // Apply to document
        document.documentElement.setAttribute("data-theme", state.theme);
        if (state.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      }
    },
  },
});

// ── Selectors ────────────────────────────────────────────────────────────

export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;
export const selectThemeIsDark = (state: { theme: ThemeState }) => state.theme.theme === "dark";
export const selectIsThemeInitialized = (state: { theme: ThemeState }) => state.theme.isInitialized;

// ── Exports ──────────────────────────────────────────────────────────────

export const { setTheme, toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
