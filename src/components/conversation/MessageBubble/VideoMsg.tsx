import { Play } from "lucide-react";
import { getFileIcon } from "./utils";
import { VideoMsgProps } from "./types";
import { memo, useState, useEffect } from "react";
import { FilePreviewModal } from "./FilePreviewModal";

export const VideoMsg = memo(function VideoMsg({ url, caption }: VideoMsgProps) {
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
      <div className="inline-block rounded-[17px] overflow-hidden">
        <div className="relative cursor-pointer group" onClick={() => setIsExpanded(true)}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Video thumbnail" className="w-auto object-cover"/>
          ) : (
            <div className="w-auto bg-[#2a2f32] flex items-center justify-center">{getFileIcon("video", 48)}</div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={28} className="text-[#54656f] ml-1" fill="#54656f" />
            </div>
          </div>

          <div className="absolute bottom-2 right-2 bg-(--overlay-bg) px-2 py-0.5 rounded text-(--text-inverse) text-xs">VIDEO</div>
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
