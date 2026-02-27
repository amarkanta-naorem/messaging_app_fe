/**
 * Store Exports
 * Centralized exports for the Redux store
 */

// Store and types
export { store, persistor, type RootState, type AppDispatch } from "./index";
export { ReduxProvider } from "./provider";
export { useAppDispatch, useAppSelector } from "./hooks";

// Auth slice exports
export {
  initializeAuth,
  loginUser,
  logoutUser,
  clearAuthState,
  updateUser,
  setAuthLoading,
  // Selectors
  selectAuth,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthUserId,
  selectIsAuthLoading,
  selectIsAuthInitialized,
} from "./slices/authSlice";
export { default as authReducer } from "./slices/authSlice";

// Chat slice exports
export {
  fetchConversations,
  fetchMessagesForConversation,
  sendMessage,
  setActiveConversationId,
  setActiveConversation,
  addMessageOptimistic,
  updateMessageInState,
  replaceOptimisticMessage,
  addIncomingMessage,
  updateConversationLastMessage,
  setChatSocketError,
  clearAllChatState,
  clearConversationMessages,
  clearActiveConversation,
  // Selectors
  selectChat,
  selectConversations,
  selectActiveConversationId,
  selectActiveConversation,
  selectMessagesForConversation,
  selectLoadingConversations,
  selectLoadingMessages,
  selectSendingMessage,
  selectConversationsError,
  selectMessagesError,
  selectSocketError,
} from "./slices/chatSlice";
export { default as chatReducer } from "./slices/chatSlice";

// Theme slice exports
export {
  setTheme,
  toggleTheme,
  initializeTheme,
  // Selectors
  selectTheme,
  selectThemeIsDark,
  selectIsThemeInitialized,
  type Theme,
} from "./slices/themeSlice";
export { default as themeReducer } from "./slices/themeSlice";

// Invite slice exports
export {
  verifyInviteCode,
  verifyInviteStart,
  verifyInviteSuccess,
  verifyInviteFailure,
  resetInvite,
  // Selectors
  selectInvite,
  selectIsVerified,
  selectInviteCode,
  selectIsInviteLoading,
  selectInviteError,
} from "./slices/inviteSlice";
export { default as inviteReducer } from "./slices/inviteSlice";
