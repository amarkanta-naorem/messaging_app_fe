import { FilePreviewModalProps } from "./types";
import { memo, useState, useEffect } from "react";
import { Download, X, Loader2 } from "lucide-react";
import { formatFileSize, getFileCategory, getFileIcon } from "./utils";

export const FilePreviewModal = memo(function FilePreviewModal({ isOpen, onClose, fileData, caption }: FilePreviewModalProps) {
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
    <div className="fixed inset-0 z-50 bg-(--overlay-bg) flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-(--overlay-light)">
        <div className="flex-1 min-w-0 pr-3 md:pr-4">
          <h3 className="text-(--text-inverse) text-sm md:text-base font-medium truncate">{fileData.name || "File"}</h3>
          {sizeStr && (<p className="text-(--text-inverse)/70 text-xs md:text-sm">{sizeStr}</p>)}
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button onClick={handleDownload} className="p-1.5 md:p-2 rounded-full bg-(--bg-hover) hover:bg-(--bg-active) transition-colors" title="Download">
            <Download size={18} className="text-(--text-inverse)" />
          </button>
          <button onClick={onClose} className="p-1.5 md:p-2 rounded-full bg-(--bg-hover) hover:bg-(--bg-active) transition-colors" title="Close">
            <X size={18} className="text-(--text-inverse)" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-4 overflow-auto">
        {category === "image" && (
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="text-(--text-inverse) animate-spin" />
              </div>
            )}
            {!imageError ? (
              <img
                src={fileData.url}
                alt={fileData.name || "Image"}
                className={`max-w-full max-h-[60vh] md:max-h-[70vh] object-contain transition-opacity ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-(--text-inverse)/70">
                <X size={40} />
                <p className="mt-2 text-sm">Failed to load image</p>
              </div>
            )}
          </div>
        )}

        {category === "video" && (
          <video src={fileData.url} controls className="max-w-full max-h-[60vh] md:max-h-[70vh] rounded-lg" onClick={(e) => e.stopPropagation()}>Your browser does not support video playback.</video>
        )}

        {category === "audio" && (
          <div className="w-full max-w-md p-4 md:p-6 bg-(--bg-hover) rounded-lg" onClick={(e) => e.stopPropagation()}>
            <audio src={fileData.url} controls className="w-full">Your browser does not support audio playback.</audio>
          </div>
        )}

        {["pdf", "document", "spreadsheet", "presentation", "archive", "other"].includes(category) && (
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-(--bg-hover) rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-(--bg-active) flex items-center justify-center mb-3 md:mb-4">{getFileIcon(fileData.mimeType, 40)}</div>
            <p className="text-(--text-inverse) text-base md:text-lg font-medium text-center mb-1.5 md:mb-2">{fileData.name || "Document"}</p>
            {sizeStr && <p className="text-(--text-inverse)/70 text-xs md:text-sm mb-3 md:mb-4">{sizeStr}</p>}
            <button onClick={handleDownload} className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-(--accent-primary) hover:bg-(--accent-hover) rounded-full text-(--text-inverse) text-sm md:text-base font-medium transition-colors">
              <Download size={16} />
              Download File
            </button>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="p-3 md:p-4 bg-(--overlay-light)" onClick={(e) => e.stopPropagation()}>
          <p className="text-(--text-inverse)/90 text-sm md:text-base">{caption}</p>
        </div>
      )}
    </div>
  );
});
