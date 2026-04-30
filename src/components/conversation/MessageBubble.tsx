import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { deleteMessage } from "@/lib/messages";
import { FormatTime } from "@/utils/FormatTime";
import { removeMessage } from "@/store/slices/chatSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { memo, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Trash2, Reply, Smile, Pencil, ArrowUpRight } from "lucide-react";
import { TaskListMsg, ImageMsg, VideoMsg, AudioMsg, FileMsg, TextMsg, MessageBubbleProps, TaskItem } from "./MessageBubble/index";

type MenuPosition = 'top' | 'bottom' | 'left' | 'right';

export const MessageBubble = memo(function MessageBubble({ message, conversationId, isOwn, showAvatar = false, showSenderName = false }: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>('bottom');
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const closeOptionsMenu = useCallback(() => { setShowOptionsMenu(false) }, []);

  useEffect(() => {
    if (showOptionsMenu && bubbleRef.current) {
      const bubble = bubbleRef.current;
      const rect = bubble.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuHeight = 280;
      const menuWidth = 240;
      const menuMargin = 8;
      
      const spaceBelow = viewportHeight - rect.bottom - menuMargin;
      const spaceAbove = rect.top - menuMargin;
      const spaceRight = viewportWidth - rect.right - menuMargin;
      const spaceLeft = rect.left - menuMargin;
      
      let bestPosition: MenuPosition = 'bottom';
      const canBottom = spaceBelow >= menuHeight;
      const canTop = spaceAbove >= menuHeight;
      const canLeft = spaceLeft >= menuWidth;
      const canRight = spaceRight >= menuWidth;
      
      if (canBottom) {
        bestPosition = 'bottom';
      } else if (canTop) {
        bestPosition = 'top';
      } else if (canRight) {
        bestPosition = 'right';
      } else if (canLeft) {
        bestPosition = 'left';
      } else {
        const available = [
          { pos: 'bottom' as MenuPosition, space: spaceBelow },
          { pos: 'top' as MenuPosition, space: spaceAbove },
          { pos: 'right' as MenuPosition, space: spaceRight },
          { pos: 'left' as MenuPosition, space: spaceLeft }
        ];
        
        available.sort((a, b) => b.space - a.space);
        bestPosition = available[0].space > 0 ? available[0].pos : 'bottom';
      }
      setMenuPosition(bestPosition);
    }
  }, [showOptionsMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showOptionsMenu]);

   const handleConfirmDelete = async () => {
     setShowDeleteConfirm(false);
     dispatch(removeMessage({ conversationId, messageId: Number(message.id) }));
     try {
       setDeleting(true);
       await deleteMessage(Number(message.id));
     } catch (error) {
       dispatch(removeMessage({ conversationId, messageId: Number(message.id) }));
       console.error("Delete failed:", error);
     } finally {
       setDeleting(false);
     }
   };

  const content = useMemo(() => {
    if (!message.content) return {};
    if (typeof message.content === "string") {
      try {
        const parsed = JSON.parse(message.content);
        return parsed;
      } catch {
        return { type: "text", text: message.content };
      }
    }
    return message.content;
  }, [message.content]);

  const messageTime = useMemo(() => (message.createdAt ? FormatTime(String(message.createdAt)) : ""), [message.createdAt]);
  const { contentType, text, url, caption, fileData } = useMemo(() => {
    const c = content;
    return {
      contentType: c?.type?.toLowerCase(),
      text: c?.text,
      url: c?.url,
      caption: c?.caption,
      fileData: c?.file || null,
    };
  }, [content]);

  const metadataFileData = useMemo(() => {
    if (message.metadata?.fileUrl) {
      return {
        name: message.metadata.fileName,
        size: message.metadata.fileSize,
        mimeType: message.metadata.mimeType,
        url: message.metadata.fileUrl,
      };
    }
    return null;
  }, [message.metadata]);

  const renderedContent = useMemo(() => {
    if (contentType === "image" && url) return <ImageMsg url={url} caption={caption} />;
    if (contentType === "video" && url) return <VideoMsg url={url} caption={caption} />;
    if (contentType === "audio" && url) return <AudioMsg url={url} isOwn={isOwn} />;
    if (contentType === "task") {
      const taskList = (content as { task_list?: TaskItem[] })?.task_list;
      const taskTitle = (content as { task_title?: string })?.task_title;
      if (taskList && taskList.length > 0) {
        return <TaskListMsg taskList={taskList} taskTitle={taskTitle} isOwn={isOwn} />;
      }
    }
    
    if (contentType === "file" || contentType === "document") {
      const fileInfo = fileData || metadataFileData;
      if (fileInfo) return <FileMsg fileData={fileInfo} caption={caption} isOwn={isOwn} />;

      if (url) {
        return (
          <FileMsg fileData={{ name: text || caption || "Document", url: url, mimeType: "application/octet-stream" }} caption={caption} isOwn={isOwn}/>
        );
      }
    }

    return <TextMsg text={text || caption || ""} />;
  }, [contentType, url, caption, fileData, metadataFileData, text, isOwn, content]);

  const bubbleClass = useMemo(() => {
    const base = "min-w-[6rem] md:min-w-[7rem] max-w-[18rem] md:max-w-[25rem] group relative shadow-sm hover:bg-opacity-90";
    const bg = isOwn ? "bg-[#d9fdd3] dark:bg-[#005c4b]" : "bg-[#ffffff] dark:bg-[#2a2f32]";
    const tail = isOwn ? `after:content-[''] after:absolute after:-right-[7.5px] after:bottom-[0px] after:w-0 after:h-0 after:border-t-[8px] after:border-t-transparent after:border-b-[0px] after:border-b-transparent after:border-l-[10px] after:border-l-[#d9fdd3] dark:after:border-l-[#005c4b] rounded-t-lg rounded-bl-lg` : `after:content-[''] after:absolute after:-left-[7.5px] after:bottom-0 after:w-0 after:h-0 after:border-t-[8px] after:border-t-transparent after:border-b-[0px] after:border-b-transparent after:border-r-[10px] after:border-r-[#ffffff] dark:after:border-r-[#2a2f32] rounded-t-lg rounded-br-lg`;
    return `${base} ${bg} ${tail} px-2 py-1`;
  }, [isOwn]);

   const handleMoreClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     if (typeof message.id === "number") {
       setShowOptionsMenu(!showOptionsMenu);
     }
   };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1 last:mb-0`} role="message">
      <div className={`flex items-end ${isOwn ? "pr-2" : "pl-0"} max-w-[85%] md:max-w-[75%]`}>
        {showAvatar && !isOwn && (
          <div className="w-9 h-9 rounded-full bg-[#e9ecef] dark:bg-[#3d4a51] shrink-0 mr-1.5 mb-0.5 overflow-hidden">
            {message.senderAvatar ? (
              <Image src={message.senderAvatar} alt="Avatar" width={36} height={36} className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium bg-[#00a884]">{message.senderName?.charAt(0)?.toUpperCase() || "?"}</div>
            )}
          </div>
        )}

        {!showAvatar && !isOwn && <div className="w-9 mr-1.5 shrink-0" />}

        <div className="flex flex-col">
          {showSenderName && !isOwn && <div className="text-[#00a884] text-xs font-medium ml-2 mb-0.5">{message.senderName}</div>}
          <div ref={bubbleRef} className={bubbleClass}>
            {renderedContent}
            {isOwn && (
               <>
                 <ChevronDown size={14} onClick={handleMoreClick} className="absolute top-1 right-1 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer" aria-label="Message options" aria-expanded={showOptionsMenu} aria-haspopup="menu"/>
                 {showOptionsMenu && (
                   <>
                     <div className="fixed inset-0 z-10" aria-hidden="true"onClick={closeOptionsMenu}/>
                     <div ref={optionsMenuRef} role="menu" aria-label="Message actions"
                       className={`absolute w-60 bg-white dark:bg-[#2a2f32] rounded-lg shadow-xl z-20 py-1 border border-[#e2e8f0] dark:border-[#4a5568] animate-in fade-in zoom-in-95 duration-150 ${
                         menuPosition === 'top' ? 'bottom-full mb-1 -left-30' :
                         menuPosition === 'bottom' ? 'mt-5 -left-30' :
                         menuPosition === 'left' ? 'right-full mr-2 top-0' :
                         menuPosition === 'right' ? 'left-full ml-2 top-0' : 'mt-2 left-0'
                       } ${menuPosition === 'left' || menuPosition === 'right' ? 'h-auto' : ''}`}
                       style={{ animationFillMode: 'both' }}
                     >
                       <button onClick={closeOptionsMenu} role="menuitem" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#333333] dark:text-[#e2e8f0] hover:bg-[#f5f6f7] dark:hover:bg-[#3d4a51] transition-colors rounded-t-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-inset">
                         <Pencil size={16} className="text-[#5b6c7d] dark:text-[#8fa6b2]" />
                         <span className="font-medium">Edit</span>
                       </button>
                       
                       <button onClick={() => { closeOptionsMenu(); setShowDeleteConfirm(true); }} role="menuitem" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset">
                         <Trash2 size={16} />
                         <span className="font-medium">Delete</span>
                       </button>
                       
                       <div className="h-px bg-[#e2e8f0] dark:bg-[#4a5568] my-1" />
                       
                       <button onClick={closeOptionsMenu} role="menuitem" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#333333] dark:text-[#e2e8f0] hover:bg-[#f5f6f7] dark:hover:bg-[#3d4a51] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-inset">
                         <Reply size={16} className="text-[#5b6c7d] dark:text-[#8fa6b2]" />
                         <span className="font-medium">Reply</span>
                       </button>
                       
                       <button onClick={closeOptionsMenu} role="menuitem" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#333333] dark:text-[#e2e8f0] hover:bg-[#f5f6f7] dark:hover:bg-[#3d4a51] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-inset">
                         <ArrowUpRight size={16} className="text-[#5b6c7d] dark:text-[#8fa6b2]" />
                         <span className="font-medium">Forward</span>
                       </button>
                       
                       <button onClick={closeOptionsMenu} role="menuitem" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#333333] dark:text-[#e2e8f0] hover:bg-[#f5f6f7] dark:hover:bg-[#3d4a51] transition-colors rounded-b-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-inset">
                         <Smile size={16} className="text-[#5b6c7d] dark:text-[#8fa6b2]" />
                         <span className="font-medium">React</span>
                       </button>
                     </div>
                   </>
                 )}
               </>
             )}
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="text-[10px] text-[#667781] dark:text-[#aebac2] leading-none">{messageTime}</span>
            </div>
          </div>
          <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleConfirmDelete} title="Delete message" message="Delete this message for everyone in the chat?" confirmLabel="Delete" variant="danger" loading={deleting} />
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
