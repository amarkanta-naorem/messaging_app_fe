/**
 * Message service - client-side.
 * SRP: Handles all message-related API calls through BFF.
 */

import { get, post } from "./api-client";
import type { Message, SendMessagePayload, SendMessageResponse } from "@/types";
import type { ApiEnvelope } from "@/types/api";

export async function getMessages(conversationId: number): Promise<Message[]> {
  const res = await get<ApiEnvelope<{ messages: Message[] }>>(
    `/conversations/${conversationId}/messages`
  );
  return res.data?.messages ?? [];
}

export async function getGroupMessages(groupId: number): Promise<Message[]> {
  const res = await get<ApiEnvelope<{ messages: Message[] }>>(
    `/groups/${groupId}/messages`
  );
  return res.data?.messages ?? [];
}

export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  const res = await post<ApiEnvelope<SendMessageResponse>>("/messages", payload);
  return res.data;
}
