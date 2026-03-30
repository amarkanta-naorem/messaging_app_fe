import { Badge } from "@/components/ui";
import { FormatTime } from "@/utils/FormatTime";
import { File, Image as ImageIcon, Video, Music, FileText, FileSpreadsheet, Presentation } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  avatar: string | null;
  phone?: string;
}

interface TextContent {
  type: string;
  text: string;
}

interface TaskContent {
  type: string;
  task_title: string;
}

interface FileContent {
  type: string;
  caption: string | null;
  file: {
    name: string;
    size: number;
    mimeType: string;
    url: string;
  };
}

interface LastMessage {
  content: TextContent | TaskContent | FileContent;
  createdAt?: string | number;
}

interface ConversationItemProps {
  id: number;
  participant?: Participant;
  name?: string;
  avatar?: string | null;
  lastMessage?: LastMessage | null;
  unreadCount?: number;
  isGroup?: boolean;
  isActive?: boolean;
  onClick: () => void;
  createdAt?: string;
  description?: string;
}

function isFileContent(content: TextContent | TaskContent | FileContent): content is FileContent {
  return content.type === 'file';
}

function isTaskContent(content: TextContent | TaskContent | FileContent): content is TaskContent {
  return content.type === 'task';
}

function isTextContent(content: TextContent | TaskContent | FileContent): content is TextContent {
  return content.type === 'text';
}

function getFileDisplayText(fileContent: FileContent): string {
  if (fileContent.caption && fileContent.caption.trim()) {
    return fileContent.caption;
  }
  
  // Generate text based on MIME type
  const mimeType = fileContent.file.mimeType;
  if (mimeType.startsWith('image/')) {
    return 'Photo';
  } else if (mimeType.startsWith('video/')) {
    return 'Video';
  } else if (mimeType.startsWith('audio/')) {
    return 'Audio';
  } else if (mimeType === 'application/pdf') {
    return 'PDF Document';
  } else if (mimeType.includes('document') || mimeType.includes('word')) {
    return 'Document';
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'Spreadsheet';
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return 'Presentation';
  } else {
    return 'File';
  }
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else if (mimeType.startsWith('video/')) {
    return <Video className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else if (mimeType.startsWith('audio/')) {
    return <Music className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else if (mimeType === 'application/pdf') {
    return <FileText className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else if (mimeType.includes('document') || mimeType.includes('word')) {
    return <FileText className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return <Presentation className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  } else {
    return <File className="w-4 h-4 text-(--text-tertiary) mr-1 shrink-0" />;
  }
}

export function ConversationItem({ participant, name, avatar, lastMessage, unreadCount = 0, isGroup = false, isActive = false, onClick, createdAt, description }: ConversationItemProps) {
  const displayName = isGroup ? name : participant?.name;
  const displayAvatar = isGroup ? avatar : participant?.avatar;

  return (
    <div onClick={onClick} className={`flex items-center px-3 cursor-pointer hover:bg-(--bg-hover) group ${isActive ? 'bg-(--bg-active)' : ''}`} title={displayName}>
      <div className="py-2.5 md:py-3 pr-2.5 md:pr-3">
        <div className="w-11 h-11 md:w-12.25 md:h-12.25 rounded-full bg-(--bg-tertiary) overflow-hidden">
          {displayAvatar ? (
            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--text-secondary) font-semibold text-lg md:text-xl bg-(--bg-tertiary)">{displayName?.charAt(0)?.toUpperCase() || "?"}</div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 py-2.5 md:py-3 border-b border-(--border-primary) group-hover:border-transparent">
        <div className="flex justify-between items-center mb-0.5 md:mb-1">
          <span className="text-(--text-primary) text-[15px] md:text-[17px] font-normal truncate">{displayName} </span>
          {isGroup ? (
            createdAt && (
              <span className="text-[11px] md:text-[12px] text-(--text-tertiary)">{FormatTime(createdAt.toString())}</span>
            )
          ) : (
            lastMessage?.createdAt && (
              <span className={`text-[11px] md:text-[12px] ${unreadCount > 0 ? "text-[#25d366] font-medium" : "text-(--text-tertiary)"}`}>{FormatTime(lastMessage.createdAt.toString())}</span>
            )
          )}
        </div>
        <div className="flex justify-between items-center">
          {isGroup ? (
            <span className="text-(--text-tertiary) text-[13px] md:text-[14px] truncate flex-1 mr-2 flex items-center">
              {lastMessage?.content && isTaskContent(lastMessage.content)
                ? lastMessage.content.task_title 
                : lastMessage?.content && isFileContent(lastMessage.content)
                ? <>
                    {getFileIcon(lastMessage.content.file.mimeType)}
                    {getFileDisplayText(lastMessage.content)}
                  </>
                : lastMessage?.content && isTextContent(lastMessage.content)
                ? lastMessage.content.text 
                : "No messages"
              }
            </span>
          ) : (
            <span className="text-(--text-tertiary) text-[13px] md:text-[14px] truncate flex-1 mr-2 flex items-center">
              {lastMessage?.content && isTaskContent(lastMessage.content)
                ? lastMessage.content.task_title 
                : lastMessage?.content && isFileContent(lastMessage.content)
                ? <>
                    {getFileIcon(lastMessage.content.file.mimeType)}
                    {getFileDisplayText(lastMessage.content)}
                  </>
                : lastMessage?.content && isTextContent(lastMessage.content)
                ? lastMessage.content.text 
                : "No messages"
              }
            </span>
          )}
          {unreadCount > 0 && (
            <Badge variant="primary" pill>{unreadCount}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;
