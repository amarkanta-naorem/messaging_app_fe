/**
 * Redux Middleware for logging, error handling, and analytics
 */

import { Middleware, isAnyOf } from "@reduxjs/toolkit";
import { logoutUser } from "../slices/authSlice";
import { clearAllChatState } from "../slices/chatSlice";

// ── Types ──────────────────────────────────────────────────────────────────

interface ActionWithPayload {
  type: string;
  payload?: any;
  error?: any;
}

// ── Logger Middleware ───────────────────────────────────────────────────

/**
 * Logging middleware for development
 * Logs all actions and state changes
 */
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  // Skip logging in production for performance
  if (process.env.NODE_ENV === "production") {
    return next(action);
  }

  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  // Format action for readability
  const actionObj = action as ActionWithPayload;
  const formattedAction = typeof action === 'object' && action !== null 
    ? { type: actionObj.type, payload: actionObj.payload ? '...' : undefined }
    : action;

  console.group(`🔄 Redux Action: ${actionObj.type}`);
  console.log("Previous State:", prevState);
  console.log("Action:", formattedAction);
  console.log("Next State:", nextState);
  console.groupEnd();

  return result;
};

// ── Error Handler Middleware ────────────────────────────────────────────

/**
 * Error handling middleware
 * Centralizes error handling for async actions
 */
export const errorHandlerMiddleware: Middleware = (store) => (next) => (action) => {
  const typedAction = action as ActionWithPayload;
  
  // Check for rejected async actions (errors)
  if (typedAction.type?.endsWith("/rejected")) {
    const error = typedAction.error || typedAction.payload;
    
    console.error("🚨 Redux Error:", {
      type: typedAction.type,
      error: error,
      message: error?.message || error || "Unknown error",
    });
    
    // You could dispatch to an error slice here if needed
    // store.dispatch(setGlobalError({ type: typedAction.type, error }));
  }
  
  return next(action);
};

// ── Session Management Middleware ────────────────────────────────────────

/**
 * Session management middleware
 * Handles cross-slice state coordination for auth events
 * CRITICAL: Ensures complete state reset on logout
 */
export const sessionManagementMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // When logout succeeds, clear ALL related state
  if (logoutUser.fulfilled.match(action)) {
    console.log("🔐 Session: Logout detected, clearing all user state...");
    
    // Dispatch chat state clear
    store.dispatch(clearAllChatState());
    
    // Clear any other sensitive state here (e.g., notifications, ui preferences)
    // store.dispatch(clearNotifications());
    // store.dispatch(clearUIState());
    
    // Clear localStorage completely
    if (typeof window !== "undefined") {
      // Force a full page reload to ensure clean state
      // This is the safest approach for complete session isolation
      localStorage.clear();
    }
  }
  
  return result;
};

// ── Analytics Middleware ────────────────────────────────────────────────

/**
 * Analytics middleware for tracking user actions
 * Can be extended to send events to analytics services
 */
export const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  const typedAction = action as ActionWithPayload;
  
  // Track specific user actions
  const trackedActions = [
    "chat/fetchConversations/fulfilled",
    "chat/fetchMessages/fulfilled",
    "chat/sendMessage/fulfilled",
    "auth/login/fulfilled",
    "auth/logout/fulfilled",
  ];
  
  if (trackedActions.includes(typedAction.type)) {
    const state = store.getState();
    const userId = state.auth.userId;
    
    console.log("📊 Analytics:", {
      action: typedAction.type,
      userId: userId,
      timestamp: Date.now(),
    });
    
    // Here you could send to analytics services:
    // analytics.track(typedAction.type, { userId, ... });
  }
  
  return next(action);
};

// ── Export Combined Middleware ──────────────────────────────────────────

/**
 * Create all middleware for the store
 */
export const createMiddleware = () => [
  loggerMiddleware,
  errorHandlerMiddleware,
  sessionManagementMiddleware,
  analyticsMiddleware,
];

export default createMiddleware;
