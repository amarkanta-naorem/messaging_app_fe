/**
 * Conversations module - wraps the conversation service.
 * Kept for backward compatibility - delegates to services.
 *
 * DEPRECATED: Import directly from @/services/conversation.service instead.
 */

import * as conversationService from "@/services/conversation.service";
import type { Conversation } from "@/types";

export type { Conversation };

export const getConversations = conversationService.getConversations;
export const createDirectConversation = conversationService.createDirectConversation;
