import { getToken } from "./auth";
import { API_BASE } from "./config";

export interface Participant {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
}

export interface LastMessage {
  id: number;
  content: {
    type: string;
    text: string;
  };
  senderId: number;
  status: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  participant: Participant;
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export async function getConversations(): Promise<ConversationsResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}
