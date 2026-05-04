import type { ApiEnvelope } from "@/types/api";
import { del, get, post, requestWithToast, _request } from "./api-client";
import type { Message, MessageContent, SendMessagePayload, SendMessageResponse, SendFileMessagePayload } from "@/types";

export async function getMessages(conversationId: number): Promise<Message[]> {
  const res = await get<ApiEnvelope<{ messages: Message[] }>>(`/conversations/${conversationId}/messages/proxy`);
  return res.data?.messages ?? [];
}

export async function getGroupMessages(groupId: number): Promise<Message[]> {
  const res = await get<ApiEnvelope<{ messages: Message[] }>>(`/groups/${groupId}/messages`);
  return res.data?.messages ?? [];
}

export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  const res = await requestWithToast<ApiEnvelope<SendMessageResponse>>("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res || !res.data) {
    throw new Error("Failed to send message");
  }
  return res.data;
}

export async function sendFileMessage(payload: SendFileMessagePayload): Promise<SendMessageResponse> {
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
  
  const formData = new FormData();
  
  if (payload.clientMessageId) {
    formData.append('clientMessageId', payload.clientMessageId);
  }
  
  if (payload.receiverPhone) {
    formData.append('receiverPhone', payload.receiverPhone);
  } else if (payload.groupId) {
    formData.append('groupId', String(payload.groupId));
  }
  
  formData.append('content[type]', 'file');
  if (caption) {
    formData.append('content[caption]', caption);
  }
  
  formData.append('file', payload.file);
  
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const response = await requestWithToast<Response>("/messages", {
    method: "POST",
    headers: {...(token ? { Authorization: `Bearer ${token}` } : {})},
    body: formData
  });
  
  if (!response) {
    throw new Error("Failed to upload file");
  }
  
  const data = await response.json();
  return data.data;
}

export async function deleteMessage(messageId: number): Promise<{ messageId: number }> {
  const res = await del<ApiEnvelope<{ messageId: number }>>(`/messages/${messageId}`);
  if (!res.data) {
    throw new Error("Delete response missing data");
  }
  return res.data;
}

export interface DeleteMessagesPayload {
  messageIds: number[];
  deleteForEveryone?: boolean;
}

export interface DeletedMessageInfo {
  id: number;
  conversationId: number;
  senderId: number;
  content: MessageContent;
  status: string;
  createdAt: string;
  isDeletedForEveryone: boolean;
  isDeletedForMe: boolean;
}

export interface DeleteMessagesResponse {
  deleted: DeletedMessageInfo[];
  failed: { messageId: number; reason: string }[];
}

export async function deleteMessages(payload: DeleteMessagesPayload): Promise<DeleteMessagesResponse> {
  const res = await _request<ApiEnvelope<DeleteMessagesResponse>>("/messages", {
    method: "DELETE",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.data) {
    throw new Error("Delete response missing data");
  }
  return res.data;
}

export async function deleteMessagesForMe(messageIds: number[]): Promise<DeleteMessagesResponse> {
  return deleteMessages({ messageIds, deleteForEveryone: false });
}

export async function deleteMessagesForEveryone(messageIds: number[]): Promise<DeleteMessagesResponse> {
  return deleteMessages({ messageIds, deleteForEveryone: true });
}
