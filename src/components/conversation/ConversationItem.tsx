/**
 * ConversationItem - Displays a single conversation in the list.
 * Used for both direct messages and group conversations.
 */

import { FormatTime } from "@/utils/FormatTime";
import { Badge } from "@/components/ui";

interface Participant {
  id: number;
  name: string;
  avatar: string | null;
  phone?: string;
}

interface LastMessage {
  content: { text?: string };
  createdAt?: string | number;
}

interface ConversationItemProps {
  /** The conversation ID */
  id: number;
  /** The participant (for direct messages) */
  participant?: Participant;
  /** Group name (for group chats) */
  name?: string;
  /** Group logo */
  avatar?: string | null;
  /** Last message in the conversation */
  lastMessage?: LastMessage | null;
  /** Number of unread messages */
  unreadCount?: number;
  /** Whether this is a group conversation */
  isGroup?: boolean;
  /** Whether this conversation is currently active */
  isActive?: boolean;
  /** Callback when item is clicked */
  onClick: () => void;
  /** Created timestamp (for groups) */
  createdAt?: string;
  /** Description (for groups) */
  description?: string;
}

export function ConversationItem({
  participant,
  name,
  avatar,
  lastMessage,
  unreadCount = 0,
  isGroup = false,
  isActive = false,
  onClick,
  createdAt,
  description,
}: ConversationItemProps) {
  const displayName = isGroup ? name : participant?.name;
  const displayAvatar = isGroup ? avatar : participant?.avatar;

  return (
    <div
      onClick={onClick}
      className={`flex items-center px-3 cursor-pointer hover:bg-(--bg-hover) group ${
        isActive ? "bg-(--bg-active)" : "bg-(--bg-card)"
      }`}
      title={displayName}
    >
      <div className="py-3 pr-3">
        <div className="w-12.25 h-12.25 rounded-full bg-(--bg-tertiary) overflow-hidden">
          {displayAvatar ? (
            <img 
              src={displayAvatar} 
              alt={displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--text-secondary) font-semibold text-xl bg-(--bg-tertiary)">
              {displayName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 py-3 border-b border-(--border-primary) group-hover:border-transparent">
        <div className="flex justify-between items-center mb-1">
          <span className="text-(--text-primary) text-[17px] font-normal truncate">
            {displayName} 
          </span>
          {isGroup ? (
            createdAt && (
              <span className="text-[12px] text-(--text-tertiary)">
                {FormatTime(createdAt.toString())}
              </span>
            )
          ) : (
            lastMessage?.createdAt && (
              <span 
                className={`text-[12px] ${
                  unreadCount > 0 ? "text-[#25d366] font-medium" : "text-(--text-tertiary)"
                }`}
              >
                {FormatTime(lastMessage.createdAt.toString())}
              </span>
            )
          )}
        </div>
        <div className="flex justify-between items-center">
          {isGroup ? (
            <span className="text-(--text-tertiary) text-[14px] truncate flex-1 mr-2">
              {description || "Group"}
            </span>
          ) : (
            <span className="text-(--text-tertiary) text-[14px] truncate flex-1 mr-2">
              {typeof lastMessage?.content?.text === 'string' 
                ? lastMessage?.content?.text 
                : "No messages"
              }
            </span>
          )}
          {unreadCount > 0 && (
            <Badge variant="primary" pill>
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;
