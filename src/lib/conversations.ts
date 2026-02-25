import { getToken } from "./auth";
import { API_BASE } from "./config";
import { parseApiResponse } from "./api";

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
  type: string;
  isGroup?: boolean;
}

export async function getConversations(): Promise<Conversation[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await parseApiResponse<Conversation[]>(res);
  return data;
}
