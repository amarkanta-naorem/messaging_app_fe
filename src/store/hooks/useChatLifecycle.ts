/**
 * Chat Lifecycle Hook
 * Manages chat state based on route changes
 * Addresses: Stale state after navigation
 */

"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchConversations,
  setActiveConversationId,
  setActiveConversation,
  clearConversationMessages,
  clearActiveConversation,
  selectActiveConversationId,
  selectConversations,
  selectLoadingConversations,
} from "../store";
import { selectIsAuthenticated } from "../store";
import type { Conversation } from "@/types";

// ── Constants ────────────────────────────────────────────────────────────

const CHAT_ROUTE = "/chat";
const DASHBOARD_ROUTE = "/dashboard";

/**
 * Hook to manage chat lifecycle based on route changes
 * 
 * Features:
 * - Fetch conversations when user navigates to chat
 * - Clear active conversation when leaving chat
 * - Reset chat state when logging out
 */
export function useChatLifecycle() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const conversations = useAppSelector(selectConversations);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const loadingConversations = useAppSelector(selectLoadingConversations);

  // Check if we're on the chat route
  const isOnChatRoute = pathname?.startsWith(CHAT_ROUTE);
  const isOnDashboardRoute = pathname === DASHBOARD_ROUTE;

  // Fetch conversations when user navigates to chat
  // Note: ChatContext already handles fetching, so we don't duplicate here
  // to prevent race conditions and loading states
  useEffect(() => {
    // Just track loading state, don't trigger fetches
  }, []);

  // Clear active conversation when navigating away from chat
  useEffect(() => {
    // When navigating to dashboard from chat, clear the active conversation
    if (activeConversationId && isOnDashboardRoute) {
      dispatch(clearActiveConversation());
    }
  }, [pathname, activeConversationId, isOnDashboardRoute, dispatch]);

  // Clear chat state when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearActiveConversation());
    }
  }, [isAuthenticated, dispatch]);

  /**
   * Select a conversation and navigate to it
   */
  const selectConversation = useCallback(
    (conversation: Conversation | null) => {
      if (conversation === null) {
        dispatch(setActiveConversationId(null));
        router.push(CHAT_ROUTE);
      } else {
        dispatch(setActiveConversationId(conversation.id));
        router.push(`${CHAT_ROUTE}?conversationId=${conversation.id}`);
      }
    },
    [dispatch, router]
  );

  /**
   * Leave the current conversation (go back to conversation list)
   */
  const leaveConversation = useCallback(() => {
    if (activeConversationId) {
      dispatch(clearActiveConversation());
      router.push(CHAT_ROUTE);
    }
  }, [activeConversationId, dispatch, router]);

  /**
   * Refresh conversations manually
   */
  const refreshConversations = useCallback(() => {
    if (isAuthenticated) {
      (dispatch as any)(fetchConversations());
    }
  }, [isAuthenticated, dispatch]);

  return {
    // State
    isOnChatRoute,
    isOnDashboardRoute,
    activeConversationId,
    conversations,
    loadingConversations,
    
    // Actions
    selectConversation,
    leaveConversation,
    refreshConversations,
  };
}

export default useChatLifecycle;
