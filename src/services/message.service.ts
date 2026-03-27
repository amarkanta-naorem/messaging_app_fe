/**
 * Message service - client-side.
 * SRP: Handles all message-related API calls through BFF.
 */

import { get, post } from "./api-client";
import type { Message, SendMessagePayload, SendMessageResponse, SendFileMessagePayload } from "@/types";
import type { ApiEnvelope } from "@/types/api";

export async function getMessages(conversationId: number): Promise<Message[]> {
  const res = await get<ApiEnvelope<{ messages: Message[] }>>(
    `/conversations/${conversationId}/messages/proxy`
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

/**
 * Send a file message using multipart/form-data
 * Use bracket notation for nested content object
 */
export async function sendFileMessage(payload: SendFileMessagePayload): Promise<SendMessageResponse> {
  // Get caption from content
  let caption = "";
  if (typeof payload.content === 'string') {
    try {
      const parsed = JSON.parse(payload.content);
      caption = parsed.caption || "";
    } catch {
      caption = "";
    }
  } else if (payload.content && typeof payload.content === 'object') {
    caption = (payload.content as { caption?: string }).caption || "";
  }
  
  // Create FormData for multipart upload
  const formData = new FormData();
  
  // Add client message ID if provided
  if (payload.clientMessageId) {
    formData.append('clientMessageId', payload.clientMessageId);
  }
  
  // Add receiverPhone OR groupId - one must be present
  if (payload.receiverPhone) {
    formData.append('receiverPhone', payload.receiverPhone);
  } else if (payload.groupId) {
    formData.append('groupId', String(payload.groupId));
  }
  
  // Use bracket notation for nested content object
  // content[type] = "file"
  // content[caption] = "caption value"
  formData.append('content[type]', 'file');
  if (caption) {
    formData.append('content[caption]', caption);
  }
  
  // Add the file
  formData.append('file', payload.file);
  
  console.log("Sending file as multipart/form-data with bracket notation");
  console.log("File:", payload.file.name, payload.file.size, payload.file.type);
  
  // Get token
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  // Use the Next.js API proxy route with FormData
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload file" }));
    throw new Error(errorData.message || "Failed to upload file");
  }
  
  const data = await response.json();
  return data.data;
}
