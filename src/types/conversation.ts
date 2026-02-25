/**
 * Conversation-related type definitions.
 */

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
  updatedAt?: string;
  type?: string;
  isGroup?: boolean;
}
