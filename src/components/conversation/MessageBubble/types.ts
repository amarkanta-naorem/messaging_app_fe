export interface MessageFile {
  name?: string;
  size?: number;
  mimeType?: string;
  url?: string;
}

export interface ExtendedMessageContent {
  type?: string;
  text?: string;
  url?: string;
  caption?: string;
  file?: MessageFile;
}

export interface ExtendedMessage {
  id: number | string;
  senderId?: number;
  senderName?: string;
  receiverId?: number;
  groupId?: number;
  conversationId?: number;
  content: ExtendedMessageContent | string;
  status?: "sent" | "delivered" | "stored" | "read" | "failed";
  createdAt?: string | number;
  clientMessageId?: string;
  senderAvatar?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    fileUrl?: string;
  };
}

export interface MessageBubbleProps {
  message: ExtendedMessage;
  conversationId: number;
  isOwn: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  currentUserId?: number | string;
}

export interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData?: { name?: string; size?: number; mimeType?: string; url?: string };
  caption?: string;
}

export interface VideoMsgProps {
  url?: string;
  caption?: string;
}

export interface ImageMsgProps {
  url?: string;
  caption?: string;
}

export interface AudioMsgProps {
  url?: string;
  isOwn: boolean;
}

export interface FileMsgProps {
  fileData?: { name?: string; size?: number; mimeType?: string; url?: string };
  caption?: string;
  isOwn: boolean;
}

export interface TextMsgProps {
  text?: string;
}

export interface TaskItem {
  sortOrder: number;
  title: string;
  isCompleted: boolean;
  status: string;
}

export interface TaskListMsgProps {
  taskList: TaskItem[];
  taskTitle?: string;
  isOwn: boolean;
}
