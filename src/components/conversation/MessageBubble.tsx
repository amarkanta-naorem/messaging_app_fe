import { memo, useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { FormatTime } from "@/utils/FormatTime";
import { File, Image as ImageIcon, Video, Music, FileText, Download, Play, Pause, X, Maximize2, Loader2, FileSpreadsheet, FileArchive, Presentation } from "lucide-react";

interface MessageFile {
  name?: string;
  size?: number;
  mimeType?: string;
  url?: string;
}

interface ExtendedMessageContent {
  type?: string;
  text?: string;
  url?: string;
  caption?: string;
  file?: MessageFile;
}

interface ExtendedMessage {
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

interface MessageBubbleProps {
  message: ExtendedMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  currentUserId?: number | string;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData?: { name?: string; size?: number; mimeType?: string; url?: string };
  caption?: string;
}

interface VideoMsgProps {
  url?: string;
  caption?: string;
}

interface ImageMsgProps {
  url?: string;
  caption?: string;
}

interface AudioMsgProps {
  url?: string;
  isOwn: boolean;
}

interface FileMsgProps {
  fileData?: { name?: string; size?: number; mimeType?: string; url?: string };
  caption?: string;
  isOwn: boolean;
}

interface TextMsgProps {
  text?: string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileExtension(filename?: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
}

function getFileCategory(mimeType?: string): string {
  if (!mimeType) return "other";
  const type = mimeType.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("spreadsheet") || type.includes("excel")) return "spreadsheet";
  if (type.includes("presentation") || type.includes("powerpoint")) return "presentation";
  if (type.includes("zip") || type.includes("archive") || type.includes("rar")) return "archive";
  if (type.includes("word") || type.includes("document")) return "document";
  return "other";
}

function getFileIcon(mimeType?: string, size: number = 24) {
  const category = getFileCategory(mimeType);
  switch (category) {
    case "image":
      return <ImageIcon size={size} />;
    case "video":
      return <Video size={size} />;
    case "audio":
      return <Music size={size} />;
    case "pdf":
      return <FileText size={size} />;
    case "spreadsheet":
      return <FileSpreadsheet size={size} />;
    case "presentation":
      return <Presentation size={size} />;
    case "archive":
      return <FileArchive size={size} />;
    case "document":
      return <FileText size={size} />;
    default:
      return <File size={size} />;
  }
}

const FilePreviewModal = memo(function FilePreviewModal({ isOpen, onClose, fileData, caption }: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [isOpen]);

  if (!isOpen || !fileData?.url) return null;

  const category = getFileCategory(fileData.mimeType);
  const sizeStr = formatFileSize(fileData.size);

  const handleDownload = () => {
    if (fileData.url) {
      const link = document.createElement("a");
      link.href = fileData.url;
      link.download = fileData.name || "download";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/40">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-white text-base font-medium truncate">{fileData.name || "File"}</h3>
          {sizeStr && (<p className="text-white/70 text-sm">{sizeStr}</p>)}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Download">
            <Download size={20} className="text-white" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Close">
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {category === "image" && (
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={40} className="text-white animate-spin" />
              </div>
            )}
            {!imageError ? (
              <img
                src={fileData.url}
                alt={fileData.name || "Image"}
                className={`max-w-full max-h-[70vh] object-contain transition-opacity ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/70">
                <X size={48} />
                <p className="mt-2">Failed to load image</p>
              </div>
            )}
          </div>
        )}

        {category === "video" && (
          <video src={fileData.url} controls className="max-w-full max-h-[70vh] rounded-lg" onClick={(e) => e.stopPropagation()}>Your browser does not support video playback.</video>
        )}

        {category === "audio" && (
          <div className="w-full max-w-md p-6 bg-white/10 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <audio src={fileData.url} controls className="w-full">Your browser does not support audio playback.</audio>
          </div>
        )}

        {["pdf", "document", "spreadsheet", "presentation", "archive", "other"].includes(category) && (
          <div className="flex flex-col items-center justify-center p-8 bg-white/10 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">{getFileIcon(fileData.mimeType, 48)}</div>
            <p className="text-white text-lg font-medium text-center mb-2">{fileData.name || "Document"}</p>
            {sizeStr && <p className="text-white/70 text-sm mb-4">{sizeStr}</p>}
            <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-[#00a884] hover:bg-[#008f6d] rounded-full text-white font-medium transition-colors">
              <Download size={18} />
              Download File
            </button>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="p-4 bg-black/40" onClick={(e) => e.stopPropagation()}>
          <p className="text-white/90 text-base">{caption}</p>
        </div>
      )}
    </div>
  );
});

const ImageMsg = memo(function ImageMsg({ url, caption}: ImageMsgProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!url) return null;

  return (
    <>
      <div className="relative cursor-pointer rounded-lg overflow-hidden group inline-block" onClick={() => setIsExpanded(true)}>
        {isLoading && (
          <div className="absolute inset-0 bg-[#e4e6e9] dark:bg-[#3d4a51] flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#8696a1]" />
          </div>
        )}

        <img
          src={url}
          alt={caption || "Image"}
          className={`max-w-70 max-h-80 object-cover block transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />

        {hasError && (
          <div className="absolute inset-0 bg-[#e4e6e9] dark:bg-[#3d4a51] flex flex-col items-center justify-center p-4">
            <X size={32} className="text-[#8696a1]" />
            <p className="text-[#8696a1] text-sm mt-1">Failed to load</p>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
            <Maximize2 size={20} className="text-white" />
          </div>
        </div>
      </div>

      {caption && <p className="text-[15px] text-[#111921] dark:text-[#e9ecef] mt-1 block">{caption}</p> }

      {isExpanded && (
        <FilePreviewModal isOpen={isExpanded} onClose={() => setIsExpanded(false)} fileData={{ url: url }} caption={caption}/>
      )}
    </>
  );
});

const VideoMsg = memo(function VideoMsg({ url, caption }: VideoMsgProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      setThumbnailUrl(null);
    }
  }, [url]);

  if (!url) return null;

  return (
    <>
      <div className="inline-block rounded-lg overflow-hidden">
        <div className="relative cursor-pointer group" onClick={() => setIsExpanded(true)}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Video thumbnail" className="max-w-70 max-h-80 object-cover"/>
          ) : (
            <div className="max-w-70 max-h-80 bg-[#2a2f32] flex items-center justify-center">{getFileIcon("video", 48)}</div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={28} className="text-[#54656f] ml-1" fill="#54656f" />
            </div>
          </div>

          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-white text-xs">VIDEO</div>
        </div>

        {caption && (
          <p className="text-[15px] text-[#111921] dark:text-[#e9ecef] mt-1">{caption}</p>
        )}
      </div>

      {isExpanded && (
        <FilePreviewModal isOpen={isExpanded} onClose={() => setIsExpanded(false)} fileData={{ url: url, mimeType: "video/mp4" }} caption={caption}/>
      )}
    </>
  );
});

const AudioMsg = memo(function AudioMsg({ url, isOwn }: AudioMsgProps) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrent(audio.currentTime));
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setCurrent(0);
    });
    setAudioElement(audio);
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [url]);

  const toggle = useCallback(() => {
    if (!audioElement) return;
    if (playing) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setPlaying(!playing);
  }, [audioElement, playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  if (!url) return null;

  const waveformBars = 30;
  const bars = Array.from({ length: waveformBars }).map((_, i) => {
    const progress = duration > 0 ? current / duration : 0;
    const height = 15 + Math.sin(i * 0.5 + 2) * 35 + Math.random() * 20;
    const isActive = i / waveformBars <= progress;
    return { height: Math.max(8, height), isActive };
  });

  return (
    <div className={`flex items-center gap-3 py-3 px-4 rounded-lg min-w-55 cursor-pointer active:scale-[0.98] transition-transform ${isOwn ? "bg-[#d9fdd3] hover:bg-[#cff5c5]" : "bg-[#f0f2f5] hover:bg-[#e4e6e9]"}`} onClick={toggle} role="button" aria-label={playing ? "Pause audio" : "Play audio"}>
      <button className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOwn ? "bg-[#00a884] hover:bg-[#008f6d]" : "bg-[#54656f] hover:bg-[#3d4a51]"}`}>
        {playing ? (
          <Pause size={18} className="text-white" fill="white" />
        ) : (
          <Play size={18} className="text-white ml-0.5" fill="white" />
        )}
      </button>

      {/* Waveform */}
      <div className="flex-1 h-10 flex items-center gap-0.5">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              bar.isActive
                ? isOwn
                  ? "bg-[#00a884]"
                  : "bg-[#54656f]"
                : isOwn
                ? "bg-[#00a884]/40"
                : "bg-[#54656f]/40"
            }`}
            style={{ height: `${bar.height}%`, minHeight: "4px" }}
          />
        ))}
      </div>

      <span className="text-xs text-[#667781] shrink-0 tabular-nums">{fmt(current || 0)} / {fmt(duration || 0)}</span>
    </div>
  );
});

const FileMsg = memo(function FileMsg({ fileData, caption, isOwn }: FileMsgProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fileName = fileData?.name || "Document";
  const fileSize = fileData?.size;
  const mimeType = fileData?.mimeType;
  const fileUrl = fileData?.url;
  const category = getFileCategory(mimeType);
  const sizeStr = formatFileSize(fileSize);
  const extension = getFileExtension(fileName);

  // Handle image files - show inline preview
  if (category === "image" && fileUrl) {
    return (
      <>
        <div className="relative cursor-pointer rounded-lg overflow-hidden group inline-block" onClick={() => setShowPreview(true)}>
          <img src={fileUrl} alt={fileName} className="max-w-60 max-h-55 object-cover block" loading="lazy"/>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          
          {sizeStr && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-white text-[10px] flex items-center gap-1">
              <File size={10} />
              {sizeStr}
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1.5">
            <Maximize2 size={14} className="text-white" />
          </div>
        </div>

        {caption && (
          <p className="text-[15px] text-[#111921] dark:text-[#e9ecef] mt-1">{caption}</p>
        )}

        <FilePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} fileData={fileData} caption={caption}/>
      </>
    );
  }

  if (!fileUrl) return null;

  return (
    <>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl min-w-55 max-w-70 transition-all duration-150 active:scale-[0.98] ${isOwn ? "bg-[#cbf3d6] hover:bg-[#b8e9c9] active:bg-[#a8d9b9]" : "bg-[#f0f2f5] hover:bg-[#e4e6e9] active:bg-[#d4d6d9]"} no-underline`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* File type icon */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOwn ? "bg-[#00a884]/15 text-[#00a884]" : "bg-[#dcdfe3] text-[#54656f]"}`}>
          {category === "image" ? (
            <ImageIcon size={24} />
          ) : category === "video" ? (
            <Video size={24} />
          ) : category === "audio" ? (
            <Music size={24} />
          ) : (
            getFileIcon(mimeType, 24)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] text-[#111921] dark:text-[#e9ecef] font-medium truncate block">{fileName}</p>
            {extension && (
              <span className="shrink-0 px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-[10px] font-medium text-[#667781]">{extension}</span>
            )}
          </div>
          {sizeStr && (<p className="text-xs text-[#667781] block mt-0.5">{sizeStr}</p>)}
        </div>

        <div className={`shrink-0 transition-opacity ${isHovered ? "opacity-100" : "opacity-60"}`}>
          {isOwn ? (
            <Download size={20} className="text-[#00a884]" />
          ) : (
            <Download size={20} className="text-[#54656f]" />
          )}
        </div>
      </a>

      {caption && (
        <p className="text-[15px] text-[#111921] dark:text-[#e9ecef] mt-1">{caption}</p>
      )}

      {showPreview && (
        <FilePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} fileData={fileData} caption={caption}/>
      )}
    </>
  );
});

const TextMsg = memo(function TextMsg({ text }: TextMsgProps) {
  if (!text) return null;
  return (
    <span className="text-[15.4px] text-[#111921] dark:text-[#e9ecef] whitespace-pre-wrap wrap-break-word leading-relaxed">{text}</span>
  );
});

export const MessageBubble = memo(function MessageBubble({ message, isOwn, showAvatar = false, showSenderName = false }: MessageBubbleProps) {
  const content = useMemo(() => {
    if (!message.content) return {};
    if (typeof message.content === "string") {
      return { type: "text", text: message.content };
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
  }, [contentType, url, caption, fileData, metadataFileData, text, isOwn]);

  const bubbleClass = useMemo(() => {
    const base = "px-3 py-1.5 min-w-[120px] max-w-[75%] md:max-w-[65%] relative shadow-sm";
    if (isOwn) {
      return `${base} bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tl-[18px] rounded-bl-[18px] rounded-br-[4px] rounded-tr-[18px]`;
    }
    return `${base} bg-[#ffffff] dark:bg-[#2a2f32] rounded-tl-[4px] rounded-bl-[18px] rounded-br-[18px] rounded-tr-[18px]`;
  }, [isOwn]);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1.5 last:mb-0`} role="message">
      <div className="flex items-end max-w-[85%] md:max-w-[75%]">
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-[#e9ecef] dark:bg-[#3d4a51] shrink-0 mr-1.5 self-end overflow-hidden">
            {message.senderAvatar ? (
              <Image src={message.senderAvatar} alt="Avatar" width={32} height={32} className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium bg-[#00a884]">{message.senderName?.charAt(0)?.toUpperCase() || "?"}</div>
            )}
          </div>
        )}

        {!showAvatar && !isOwn && <div className="w-8 mr-1.5 shrink-0" />}

        <div className="flex flex-col">
          {showSenderName && !isOwn && (
            <div className="text-[#00a884] text-[11.5px] font-medium ml-1 mb-0.5">{message.senderName}</div>
          )}

          <div className={bubbleClass}>
            {renderedContent}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[10.5px] text-[#667781] dark:text-[#aebac2] leading-none">{messageTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;