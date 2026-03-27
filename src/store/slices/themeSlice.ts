import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Types ───────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark"; // The actual theme after resolving system preference
  isInitialized: boolean;
  systemPreference: "light" | "dark";
}

// ── Initial State ────────────────────────────────────────────────────────

const initialState: ThemeState = {
  theme: "system",
  resolvedTheme: "light",
  isInitialized: false,
  systemPreference: "light",
};

// ── Helper Functions ─────────────────────────────────────────────────────

/**
 * Apply theme to document root for CSS variables and Tailwind
 */
function applyThemeToDOM(theme: "light" | "dark"): void {
  if (typeof window === "undefined") return;

  // Apply theme to document root for CSS variables
  document.documentElement.setAttribute("data-theme", theme);

  // Toggle dark class for Tailwind
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * Get system theme preference
 */
function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Resolve theme based on selection and system preference
 */
function resolveTheme(theme: Theme, systemPreference: "light" | "dark"): "light" | "dark" {
  if (theme === "system") {
    return systemPreference;
  }
  return theme;
}

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
      state.resolvedTheme = resolveTheme(action.payload, state.systemPreference);
      state.isInitialized = true;

      // Apply theme to DOM immediately
      applyThemeToDOM(state.resolvedTheme);
    },

    /**
     * Toggle between light and dark theme
     * If current theme is system, toggles to opposite of system preference
     */
    toggleTheme: (state) => {
      if (state.theme === "system") {
        // If system, toggle to opposite of current system preference
        state.theme = state.systemPreference === "light" ? "dark" : "light";
      } else {
        // Otherwise toggle between light and dark
        state.theme = state.theme === "light" ? "dark" : "light";
      }
      
      state.resolvedTheme = resolveTheme(state.theme, state.systemPreference);
      state.isInitialized = true;

      // Apply theme to DOM immediately
      applyThemeToDOM(state.resolvedTheme);
    },

    /**
     * Initialize theme from storage or system preference
     * Called after hydration to avoid mismatch
     */
    initializeTheme: (state) => {
      if (typeof window === "undefined") return;

      // Get system preference
      const systemPreference = getSystemPreference();
      state.systemPreference = systemPreference;

      // If theme is system, resolve it
      if (state.theme === "system") {
        state.resolvedTheme = systemPreference;
      } else {
        state.resolvedTheme = resolveTheme(state.theme, systemPreference);
      }

      state.isInitialized = true;

      // Apply to document
      applyThemeToDOM(state.resolvedTheme);
    },

    /**
     * Update system preference (called when OS theme changes)
     */
    setSystemPreference: (state, action: PayloadAction<"light" | "dark">) => {
      state.systemPreference = action.payload;
      
      // If theme is system, update resolved theme
      if (state.theme === "system") {
        state.resolvedTheme = action.payload;
        
        // Apply to DOM if initialized
        if (state.isInitialized) {
          applyThemeToDOM(state.resolvedTheme);
        }
      }
    },
  },
});

// ── Selectors ────────────────────────────────────────────────────────────

export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;
export const selectResolvedTheme = (state: { theme: ThemeState }) => state.theme.resolvedTheme;
export const selectThemeIsDark = (state: { theme: ThemeState }) => state.theme.resolvedTheme === "dark";
export const selectIsThemeInitialized = (state: { theme: ThemeState }) => state.theme.isInitialized;
export const selectSystemPreference = (state: { theme: ThemeState }) => state.theme.systemPreference;

// ── Exports ──────────────────────────────────────────────────────────────

export const { setTheme, toggleTheme, initializeTheme, setSystemPreference } = themeSlice.actions;
export default themeSlice.reducer;
