/**
 * ChatHeader - The header component shown at the top of the chat view.
 * Displays contact/group info and action buttons.
 */

import { Search, MoreVertical } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  avatar: string | null;
}

interface ChatHeaderProps {
  /** The participant (contact or group) to display */
  participant?: Participant | null;
  /** Whether this is a group conversation */
  isGroup?: boolean;
  /** Callback when avatar/name is clicked */
  onProfileClick?: () => void;
  /** Callback when search is clicked */
  onSearchClick?: () => void;
  /** Callback when more options is clicked */
  onMoreClick?: () => void;
}

export function ChatHeader({
  participant,
  isGroup = false,
  onProfileClick,
  onSearchClick,
  onMoreClick,
}: ChatHeaderProps) {
  return (
    <div className="h-14 bg-(--header-bg) theme-header-bg px-4 flex items-center justify-between shrink-0 z-10 border-b border-(--border-primary)">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={onProfileClick}
      >
        <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) overflow-hidden mr-3">
          {participant?.avatar ? (
            <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg bg-(--bg-tertiary)">
              {participant?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div>
          <div className="text-(--text-primary) text-[15px] font-medium">{participant?.name}</div>
          <div className="text-(--text-tertiary) text-[12px]">
            {isGroup ? 'group' : 'online'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-(--text-tertiary)">
        <Search size={20} className="cursor-pointer" onClick={onSearchClick} />
        <MoreVertical size={20} className="cursor-pointer" onClick={onMoreClick} />
      </div>
    </div>
  );
}

export default ChatHeader;
