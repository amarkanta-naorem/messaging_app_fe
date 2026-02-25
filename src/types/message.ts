/**
 * Message-related type definitions.
 */

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

export interface DirectConversationResponse {
  id: number;
  participantId: number;
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
