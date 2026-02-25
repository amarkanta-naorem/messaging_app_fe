/**
 * Messages module - wraps the message service.
 * Kept for backward compatibility - delegates to services.
 *
 * DEPRECATED: Import directly from @/services/message.service instead.
 */

import * as messageService from "@/services/message.service";
import * as conversationService from "@/services/conversation.service";
import type { Message, MessageContent, MessagesResponse, SendMessagePayload, SendMessageResponse } from "@/types";

export type { MessageContent, Message, MessagesResponse, SendMessagePayload, SendMessageResponse };

export async function getMessages(conversationId: number, isGroup?: boolean): Promise<Message[]> {
  if (isGroup) {
    return messageService.getGroupMessages(conversationId);
  }
  return messageService.getMessages(conversationId);
}

export const createDirectConversation = conversationService.createDirectConversation;
export const sendMessage = messageService.sendMessage;

export async function sendMessageToPhone(payload: SendMessagePayload): Promise<SendMessageResponse> {
  return messageService.sendMessage({ ...payload, receiverPhone: payload.receiverPhone });
}

export async function sendMessageToGroup(groupId: number, content: SendMessagePayload["content"], clientMessageId?: string): Promise<SendMessageResponse> {
  return messageService.sendMessage({ groupId, content, clientMessageId });
}
