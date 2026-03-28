/**
 * Redux Store Configuration
 * Implements Redux Persist with user isolation and proper SSR/CSR compatibility
 */

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import themeReducer from "./slices/themeSlice";
import inviteReducer from "./slices/inviteSlice";
import errorReducer from "./slices/errorSlice";
import { createMiddleware } from "./middleware";

// ── Persist Configuration ────────────────────────────────────────────────

/**
 * Security Note:
 * We only persist auth state (user info for session restoration).
 * Chat state is NOT persisted to prevent stale data issues.
 * This ensures fresh data on each session.
 */

const authPersistConfig = {
  key: "auth",
  storage,
  // Only persist these fields
  whitelist: ["user", "token", "lastAuthTime", "userId"],
  // Blacklist sensitive data if needed
  blacklist: ["isLoading", "isInitialized"],
};

// Persist config for invite state - persists isVerified and code
const invitePersistConfig = {
  key: "invite",
  storage,
  whitelist: ["isVerified", "code"],
};

// Persist config for theme state - persists theme preference
const themePersistConfig = {
  key: "theme",
  storage,
  // Only persist the theme preference, not system preference or resolved theme
  whitelist: ["theme"],
};

// ── Root Reducer ────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  theme: themeReducer,
  invite: inviteReducer,
});

// ── Persisted Reducers ─────────────────────────────────────────────────

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedInviteReducer = persistReducer(invitePersistConfig, inviteReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

// Note: We don't persist chat state to avoid stale data issues
// This is intentional - chat data should always be fresh

// ── Store Configuration ────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    chat: chatReducer, // Not persisted - fresh on each load
    theme: persistedThemeReducer, // Persisted via redux-persist
    invite: persistedInviteReducer, // Persisted for invite verification
    error: errorReducer, // Global error state
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks (redux-persist)
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these paths in the state (non-serializable data)
        ignoredPaths: ["chat.socket"],
      },
    }).prepend(createMiddleware()),
});

// ── Persistor ───────────────────────────────────────────────────────────

export const persistor = persistStore(store);

// ── Types ───────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Export ───────────────────────────────────────────────────────────────

export { store as default };
