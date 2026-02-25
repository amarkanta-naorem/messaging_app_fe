/**
 * Socket-related type definitions.
 */

export interface SocketMessageContent {
  type: "text" | "image" | "video" | "audio" | "document";
  text?: string;
  url?: string;
  caption?: string;
}

export interface SocketMessagePayload {
  clientMessageId: string;
  receiverId?: number;
  groupId?: number;
  content: SocketMessageContent;
}

export interface IncomingMessage {
  id: number;
  serverMessageId?: number;
  clientMessageId: string;
  conversationId?: number;
  groupId?: number;
  senderId: number;
  senderName?: string;
  receiverId: number;
  content: SocketMessageContent;
  status: "sent" | "delivered" | "read" | "failed";
  createdAt: string | number | null;
}

export interface DeliveryAck {
  messageId: number;
  clientMessageId: string;
  status: "delivered" | "stored";
}

export interface SocketError {
  code: string;
  message: string;
  clientMessageId?: string;
}
