import Image from "next/image";
import { memo, useMemo } from "react";
import { FormatTime } from "@/utils/FormatTime";
import { TaskListMsg, ImageMsg, VideoMsg, AudioMsg, FileMsg, TextMsg, MessageBubbleProps, TaskItem } from "./MessageBubble/index";

export const MessageBubble = memo(function MessageBubble({ message, isOwn, showAvatar = false, showSenderName = false }: MessageBubbleProps) {
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

  const messageTime = useMemo(
    () => (message.createdAt ? FormatTime(String(message.createdAt)) : ""),
    [message.createdAt]
  );

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
    if (contentType === "image" && url) {
      return <ImageMsg url={url} caption={caption} />;
    }

    if (contentType === "video" && url) {
      return <VideoMsg url={url} caption={caption} />;
    }

    if (contentType === "audio" && url) {
      return <AudioMsg url={url} isOwn={isOwn} />;
    }

    if (contentType === "task") {
      const taskList = (content as { task_list?: TaskItem[] })?.task_list;
      const taskTitle = (content as { task_title?: string })?.task_title;
      if (taskList && taskList.length > 0) {
        return <TaskListMsg taskList={taskList} taskTitle={taskTitle} isOwn={isOwn} />;
      }
    }
    
    if (contentType === "file" || contentType === "document") {
      const fileInfo = fileData || metadataFileData;
      if (fileInfo) {
        return <FileMsg fileData={fileInfo} caption={caption} isOwn={isOwn} />;
      }

      if (url) {
        return (
          <FileMsg
            fileData={{
              name: text || caption || "Document",
              url: url,
              mimeType: "application/octet-stream",
            }}
            caption={caption}
            isOwn={isOwn}
          />
        );
      }
    }

    return <TextMsg text={text || caption || ""} />;
  }, [contentType, url, caption, fileData, metadataFileData, text, isOwn, content]);

  const bubbleClass = useMemo(() => {
    const base = "min-w-[7rem] max-w-[25rem] relative shadow-sm";
    const bg = isOwn ? "bg-[#d9fdd3] dark:bg-[#005c4b]" : "bg-[#ffffff] dark:bg-[#2a2f32]";

    // Fixed tail styling - more subtle like in the image
    const tail = isOwn
      ? `after:content-[''] after:absolute after:-right-[7.5px] after:bottom-[0px] after:w-0 after:h-0 
         after:border-t-[8px] after:border-t-transparent 
         after:border-b-[0px] after:border-b-transparent 
         after:border-l-[10px] after:border-l-[#d9fdd3] 
         dark:after:border-l-[#005c4b] rounded-t-lg rounded-bl-lg`
      : `after:content-[''] after:absolute after:-left-[7.5px] after:bottom-0 after:w-0 after:h-0 
         after:border-t-[8px] after:border-t-transparent 
         after:border-b-[0px] after:border-b-transparent 
         after:border-r-[10px] after:border-r-[#ffffff] 
         dark:after:border-r-[#2a2f32] rounded-t-lg rounded-br-lg`;

    return `${base} ${bg} ${tail} px-2 py-1`;
  }, [isOwn]);

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
          {showSenderName && !isOwn && (
            <div className="text-[#00a884] text-xs font-medium ml-2 mb-0.5">{message.senderName}</div>
          )}

          <div className={bubbleClass}>
            {renderedContent}
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="text-[10px] text-[#667781] dark:text-[#aebac2] leading-none">{messageTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
