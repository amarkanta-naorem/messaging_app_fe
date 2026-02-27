/**
 * MessageBubble - Individual message bubble component.
 * Displays a single message with sender info, content, and timestamp.
 */

import { FormatTime } from "@/utils/FormatTime";

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
}

interface MessageBubbleProps {
  /** The message to display */
  message: Message;
  /** Whether the message is from the current user */
  isOwn: boolean;
  /** Whether to show the sender's avatar (for group chats) */
  showAvatar?: boolean;
  /** Whether to show the sender's name (for group chats) */
  showSenderName?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  showSenderName = false,
}: MessageBubbleProps) {
  // Handle both object and string content types
  const content = typeof message.content === 'string' 
    ? { text: message.content } 
    : message.content;

  const messageTime = message.createdAt 
    ? FormatTime(message.createdAt.toString()) 
    : '';

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-5`}>
      <div className="flex items-end max-w-[65%]">
        {/* Avatar */}
        {showAvatar && (
          <div className="w-7 h-7 rounded-full bg-(--bg-tertiary) shrink-0 mr-1">
            {message.senderAvatar ? (
              <img 
                src={message.senderAvatar} 
                alt="" 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                {message.senderName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        )}
        
        {!isOwn && !showAvatar && <div className="w-7 mr-1"></div>}

        <div className="flex flex-col">
          {showSenderName && (
            <div className="text-(--accent-secondary) text-[11px] font-medium ml-1 mb-0.5">
              {message.senderName}
            </div>
          )}
          
          <div className={`px-2 py-1 rounded-[7.5px] text-[14.2px] ${isOwn ? "bg-(--chat-bubble-outgoing)" : "bg-(--chat-bubble-incoming)"}`}>
            {/* Image content */}
            {content?.type === 'image' && content?.url && (
              <img src={content.url} alt="" className="max-w-50 rounded-lg" />
            )}
            {/* Text content */}
            <span className="text-(--text-primary)">
              {content?.text || content?.caption || ''}
            </span>
            {/* Timestamp */}
            <span className="text-[10px] text-(--text-muted) float-right ml-1 mt-1">
              {messageTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
