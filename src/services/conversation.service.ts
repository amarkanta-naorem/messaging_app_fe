/**
 * Conversation service - client-side.
 * SRP: Handles all conversation-related API calls through BFF.
 */

import { get, post } from "./api-client";
import type { Conversation } from "@/types";
import type { ApiEnvelope } from "@/types/api";

export async function getConversations(): Promise<Conversation[]> {
  const res = await get<ApiEnvelope<Conversation[]>>("/conversations");
  return res.data;
}

export async function createDirectConversation(targetUserId: number): Promise<{ id: number; participantId: number }> {
  const res = await post<ApiEnvelope<{ id: number; participantId: number }>>(
    "/conversations/direct",
    { targetUserId }
  );
  return res.data;
}
