export interface MessageFile {
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface MessageContent {
  type: "text" | "image" | "video" | "audio" | "document" | "file" | "task";
  text?: string;
  value?: string;
  url?: string;
  caption?: string;
  file?: MessageFile;
  task_title?: string;
  task_list?: {
    sortOrder: number;
    title: string;
    isCompleted: boolean;
    status: string;
  }[];
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
    type: "text" | "image" | "video" | "audio" | "document" | "file";
    text?: string;
    url?: string;
    caption?: string;
  };
  clientMessageId?: string;
}

export interface SendFileMessagePayload {
  clientMessageId?: string;
  receiverPhone?: string;
  groupId?: number;
  content: string | { type: string; caption?: string }; // Can be stringified JSON or object
  file: File;
}

export interface SendMessageResponse {
  id: number;
  conversationId?: number;
  groupId?: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  receiverId?: number;
  content: {
    type: string;
    text?: string;
    url?: string;
    caption?: string;
    file?: MessageFile;
  };
  metadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileUrl: string;
    extension: string;
    uploadedAt: string;
  };
  status: string;
  createdAt: string;
}
