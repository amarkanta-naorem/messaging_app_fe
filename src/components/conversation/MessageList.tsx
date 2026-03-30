import { useEffect, useRef, useMemo } from "react";
import { MessageBubble } from "./MessageBubble";

interface MessageContent {
  type?: string;
  text?: string;
  url?: string;
  caption?: string;
  file?: {
    name?: string;
    size?: number;
    mimeType?: string;
    url?: string;
  };
}

interface Message {
  id: number | string;
  senderId?: number;
  clientMessageId?: string;
  content: MessageContent | string;
  createdAt?: string | number;
  senderName?: string;
  senderAvatar?: string;
  isFromCurrentUser?: boolean;
  status?: "sent" | "delivered" | "stored" | "read" | "failed";
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    fileUrl?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: number;
  isGroup?: boolean;
  loading?: boolean;
  onMessagesChange?: () => void;
}

export function MessageList({ messages, currentUserId, isGroup = false, loading = false, onMessagesChange }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const processedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const isOwn = msg.isFromCurrentUser || msg.senderId === currentUserId || (msg.clientMessageId && !msg.senderId);
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const prevIsOwn = prevMsg?.isFromCurrentUser || prevMsg?.senderId === currentUserId || (prevMsg?.clientMessageId && !prevMsg?.senderId);
      const isNewGroup = !prevMsg || prevMsg.senderId !== msg.senderId || prevIsOwn !== isOwn;
      const showAvatar = !isOwn && isGroup && isNewGroup;
      const showSenderName = !isOwn && isGroup && msg.senderName && isNewGroup;
      
      return { ...msg, isOwn, showAvatar, showSenderName };
    });
  }, [messages, currentUserId, isGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    onMessagesChange?.();
  }, [messages, onMessagesChange]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4">
        <div className="text-center text-(--text-muted) mt-6 md:mt-8">Loading...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4">
        <div className="text-center text-(--text-muted) mt-6 md:mt-8">No messages yet</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-3 pb-3 md:pb-4">
      <div className="flex flex-col">
        {processedMessages.map((msg) => (
          <MessageBubble
            key={msg.id || msg.clientMessageId}
            message={msg}
            isOwn={!!msg.isOwn}
            showAvatar={!!msg.showAvatar}
            showSenderName={!!msg.showSenderName}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
