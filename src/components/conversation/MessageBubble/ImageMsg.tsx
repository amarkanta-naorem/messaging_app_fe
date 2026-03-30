import { memo, useState } from "react";
import { ImageMsgProps } from "./types";
import { X, Maximize2, Loader2 } from "lucide-react";
import { FilePreviewModal } from "./FilePreviewModal";

export const ImageMsg = memo(function ImageMsg({ url, caption}: ImageMsgProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!url) return null;

  return (
    <>
      <div className="relative cursor-pointer rounded-[17px] overflow-hidden group inline-block" onClick={() => setIsExpanded(true)}>
        {isLoading && (
          <div className="absolute inset-0 bg-(--bg-tertiary) flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-(--text-muted)" />
          </div>
        )}

        <img
          src={url}
          alt={caption || "Image"}
          className={`w-auto object-cover block transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />

        {hasError && (
          <div className="absolute inset-0 bg-(--bg-tertiary) flex flex-col items-center justify-center p-4">
            <X size={32} className="text-(--text-muted)" />
            <p className="text-[#8696a1] text-sm mt-1">Failed to load</p>
          </div>
        )}

        <div className="absolute inset-0 bg-transparent group-hover:bg-(--overlay-light) transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-(--overlay-bg) rounded-full p-2">
            <Maximize2 size={20} className="text-(--text-inverse)" />
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
