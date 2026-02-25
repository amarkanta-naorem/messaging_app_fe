import { getToken } from "./auth";
import { API_BASE } from "./config";

export interface MessageContent {
  type: "text" | "image" | "video" | "audio" | "document";
  text?: string;
  value?: string;
  url?: string;
  caption?: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName?: string;
  receiverId?: number;
  groupId?: number;
  conversationId?: number;
  content: MessageContent;
  status: "sent" | "delivered" | "stored" | "read" | "failed";
  createdAt: string | number;
  clientMessageId?: string;
}

export interface MessagesResponse {
  messages: Message[];
}

export async function getMessages(conversationId: number, isGroup?: boolean): Promise<Message[]> {
  const token = getToken();
  // Use different endpoint for group messages vs direct messages
  const endpoint = isGroup 
    ? `${API_BASE}/groups/${conversationId}/messages` 
    : `${API_BASE}/conversations/${conversationId}/messages`;
  
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  // Handle different response structures for groups vs direct messages
  if (isGroup && data.data?.messages) {
    return data.data.messages;
  }
  return data.messages || data;
}

export interface DirectConversationResponse {
  id: number;
  participantId: number;
}

export async function createDirectConversation(targetUserId: number): Promise<DirectConversationResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/conversations/direct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetUserId }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export interface SendMessagePayload {
  receiverPhone?: string;
  groupId?: number;
  content: {
    type: "text" | "image" | "video" | "audio" | "document";
    text?: string;
    url?: string;
    caption?: string;
  };
  clientMessageId?: string;
}

export interface SendMessageResponse {
  id: number;
  conversationId?: number;
  groupId?: number;
  senderId: number;
  receiverId?: number;
  content: {
    type: string;
    text?: string;
  };
  status: string;
  createdAt: string;
}

export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to send message");
  }
  return res.json();
}

export async function sendMessageToPhone(payload: SendMessagePayload): Promise<SendMessageResponse> {
  return sendMessage({ ...payload, receiverPhone: payload.receiverPhone });
}

export async function sendMessageToGroup(groupId: number, content: SendMessagePayload["content"], clientMessageId?: string): Promise<SendMessageResponse> {
  return sendMessage({ groupId, content, clientMessageId });
}
