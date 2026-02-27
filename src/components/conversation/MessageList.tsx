/**
 * MessageList - Container component for displaying a list of messages.
 * Handles message grouping and avatar/name display logic.
 * Optimized for modern WhatsApp-style UI/UX
 */

import { useEffect, useRef, useMemo } from "react";
import { MessageBubble } from "./MessageBubble";

interface MessageContent {
  type?: string;
  text?: string;
  url?: string;
  caption?: string;
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
}

interface MessageListProps {
  /** List of messages to display */
  messages: Message[];
  /** Current user's ID */
  currentUserId?: number;
  /** Whether this is a group conversation */
  isGroup?: boolean;
  /** Whether messages are loading */
  loading?: boolean;
  /** Callback when scroll to bottom is needed */
  onMessagesChange?: () => void;
}

export function MessageList({
  messages,
  currentUserId,
  isGroup = false,
  loading = false,
  onMessagesChange,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Process messages to add grouping metadata
  const processedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      // Determine if this message is from the current user
      const isOwn = msg.isFromCurrentUser || 
        msg.senderId === currentUserId ||
        (msg.clientMessageId && !msg.senderId);
      
      // Get previous message
      const prevMsg = index > 0 ? messages[index - 1] : null;
      
      // Determine if this is the first message from this sender
      const prevIsOwn = prevMsg?.isFromCurrentUser || 
        prevMsg?.senderId === currentUserId ||
        (prevMsg?.clientMessageId && !prevMsg?.senderId);
      
      // Check if sender changed (for grouping)
      const isNewGroup = !prevMsg || 
        prevMsg.senderId !== msg.senderId ||
        prevIsOwn !== isOwn;
      
      // Show avatar and sender name only for incoming messages in groups
      const showAvatar = !isOwn && isGroup && isNewGroup;
      const showSenderName = !isOwn && isGroup && msg.senderName && isNewGroup;
      
      return {
        ...msg,
        isOwn,
        showAvatar,
        showSenderName,
      };
    });
  }, [messages, currentUserId, isGroup]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    onMessagesChange?.();
  }, [messages, onMessagesChange]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="text-center text-(--text-muted) mt-8">Loading...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="text-center text-(--text-muted) mt-8">No messages yet</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-4">
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
