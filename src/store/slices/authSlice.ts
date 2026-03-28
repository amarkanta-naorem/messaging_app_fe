/**
 * Enhanced Auth Slice with Redux Toolkit
 * Implements proper user isolation and session management
 * Addresses: Session leakage across users, secure logout
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";
import { 
  getToken, 
  setToken as saveToken, 
  removeToken, 
  getUser, 
  setUser as saveUserToStorage, 
  removeUser 
} from "@/lib/auth";
import { getProfile } from "@/services/auth.service";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  lastAuthTime: number | null;
  userId: number | null;
}

// ── Async Thunks ───────────────────────────────────────────────────────

/**
 * Initialize auth state from storage
 * This runs on app start to restore session
 * Fetches complete user profile to ensure organisation_employees data is included
 */
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const storedToken = getToken();
      const storedUser = getUser();
      
      if (storedToken && storedUser) {
        // Fetch complete user profile to ensure organisation_employees data is included
        try {
          const profileResponse = await getProfile();
          const completeUser = profileResponse.user;
          saveUserToStorage(completeUser);
          
          return {
            user: completeUser,
            token: storedToken,
            userId: completeUser.id,
            lastAuthTime: Date.now(),
          };
        } catch (error) {
          // If profile fetch fails, fall back to the stored user data
          return {
            user: storedUser,
            token: storedToken,
            userId: storedUser.id,
            lastAuthTime: Date.now(),
          };
        }
      }
      
      return null;
    } catch (error) {
      return rejectWithValue("Failed to initialize auth");
    }
  }
);

/**
 * Login action - stores user and token
 * Fetches complete user profile to ensure organisation_employees data is included
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ user, token }: { user: User; token: string }, { dispatch }) => {
    saveToken(token);
    saveUserToStorage(user);
    
    // Fetch complete user profile to ensure organisation_employees data is included
    try {
      const profileResponse = await getProfile();
      const completeUser = profileResponse.user;
      saveUserToStorage(completeUser);
      
      return {
        user: completeUser,
        token,
        userId: completeUser.id,
        lastAuthTime: Date.now(),
      };
    } catch (error) {
      // If profile fetch fails, fall back to the original user data
      return {
        user,
        token,
        userId: user.id,
        lastAuthTime: Date.now(),
      };
    }
  }
);

/**
 * Logout action - COMPLETE state reset
 * CRITICAL: This must clear ALL user data to prevent session leakage
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, getState }) => {
    // Clear localStorage
    removeToken();
    removeUser();
    
    // Get current state before clearing (for logging)
    const state = getState() as any;
    
    // Return cleared state
    return {
      user: null,
      token: null,
      userId: null,
      lastAuthTime: null,
    };
  }
);

// ── Initial State ───────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isInitialized: false,
  lastAuthTime: null,
  userId: null,
};

// ── Slice ───────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Force clear auth state (used as fallback)
     */
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.isInitialized = true;
      state.lastAuthTime = null;
      state.userId = null;
    },
    
    /**
     * Update user profile in state
     */
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveUserToStorage(state.user);
      }
    },
    
    /**
     * Set loading state manually
     */
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.userId = action.payload.userId;
          state.lastAuthTime = action.payload.lastAuthTime;
        } else {
          state.isInitialized = true;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.lastAuthTime = action.payload.lastAuthTime;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      
      // Logout - COMPLETE RESET
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.isInitialized = true;
        state.lastAuthTime = null;
        state.userId = null;
      });
  },
});

// ── Selectors ──────────────────────────────────────────────────────────

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  !!state.auth.token && !!state.auth.user;
export const selectAuthUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectIsAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsAuthInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;

// ── Exports ─────────────────────────────────────────────────────────────

export const { clearAuthState, updateUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
