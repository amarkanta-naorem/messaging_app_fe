import { memo, useState } from "react";
import { FileMsgProps } from "./types";
import { FilePreviewModal } from "./FilePreviewModal";
import { formatFileSize, getFileExtension, getFileCategory, getFileIcon } from "./utils";
import { File, Image as ImageIcon, Video, Music, Download, Maximize2 } from "lucide-react";

export const FileMsg = memo(function FileMsg({ fileData, caption, isOwn }: FileMsgProps) {
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
        <div className="relative cursor-pointer rounded overflow-hidden group inline-block" onClick={() => setShowPreview(true)}>
          <img src={fileUrl} alt={fileName} width={200} height={200} className="object-cover block" loading="lazy"/>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          
          {sizeStr && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-white text-[10px] flex items-center gap-1">
              <File size={10} />
              {sizeStr}
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-(--overlay-bg) rounded-full p-1.5">
            <Maximize2 size={14} className="text-(--text-inverse)" />
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
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-2 rounded-lg w-auto transition-all duration-150 active:scale-[0.98] ${isOwn ? "bg-[#cbf3d6] hover:bg-[#b8e9c9] active:bg-[#a8d9b9]" : "bg-[#f0f2f5] hover:bg-[#e4e6e9] active:bg-[#d4d6d9]"} no-underline`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
            <p className="text-[13px] text-[#111921] font-medium truncate block">{fileName}</p>
            {extension && (
              <span className="shrink-0 px-1.5 py-0.5 bg-(--bg-hover) rounded text-[10px] font-medium text-(--text-muted)">{extension}</span>
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
