/**
 * ChatHeader - The header component shown at the top of the chat view.
 * Displays contact/group info and action buttons.
 */

import { Search, MoreVertical, ArrowLeft } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  avatar: string | null;
}

interface ChatHeaderProps {
  participant?: Participant | null;
  isGroup?: boolean;
  onProfileClick?: () => void;
  onSearchClick?: () => void;
  onMoreClick?: () => void;
  onBackClick?: () => void;
}

export function ChatHeader({ participant, isGroup = false, onProfileClick, onSearchClick, onMoreClick, onBackClick }: ChatHeaderProps) {
  return (
    <div className="h-14 bg-(--header-bg) theme-header-bg px-2 md:px-4 flex items-center justify-between shrink-0 z-10 border-b border-(--border-primary)">
      <div className="flex items-center cursor-pointer" onClick={onProfileClick}>
        {/* Back button - visible only on mobile */}
        {onBackClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBackClick();
            }}
            className="md:hidden p-2 -ml-2 mr-1 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover) rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) overflow-hidden mr-3">
          {participant?.avatar ? (
            <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg bg-(--bg-tertiary)">{participant?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          )}
        </div>
        <div>
          <div className="text-(--text-primary) text-[15px] font-medium">{participant?.name}</div>
          <div className="text-(--text-tertiary) text-[12px]">{isGroup ? 'group' : 'online'}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 text-(--text-tertiary)">
        <Search size={20} className="cursor-pointer" onClick={onSearchClick} />
        <MoreVertical size={20} className="cursor-pointer" onClick={onMoreClick} />
      </div>
    </div>
  );
}

export default ChatHeader;
