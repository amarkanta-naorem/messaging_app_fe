import { File, Image as ImageIcon, Video, Music, FileText, FileSpreadsheet, FileArchive, Presentation } from "lucide-react";

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getFileExtension(filename?: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
}

export function getFileCategory(mimeType?: string): string {
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

export function getFileIcon(mimeType?: string, size: number = 24) {
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
