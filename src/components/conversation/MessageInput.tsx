/**
 * MessageInput - Input component for typing and sending messages.
 * Includes file upload capability with a WhatsApp-like interface.
 */

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { SendHorizontal, Paperclip, X, File, Video, Mic } from "lucide-react";

interface FileAttachment {
  file: File;
  preview?: string;
  type: "image" | "video" | "audio" | "document";
}

interface MessageInputProps {
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  onFileUpload?: (file: File) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
}

/**
 * Determine file type from mime type
 */
function getFileType(mimeType: string): FileAttachment["type"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export function MessageInput({ onSend, onFileUpload, placeholder = "Type a message...", disabled = false, isSending = false }: MessageInputProps) {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = inputText.trim();
    if ((!text && attachments.length === 0) || disabled || isSending) return;
    
    onSend(text, attachments.length > 0 ? attachments : undefined);
    setInputText("");
    setAttachments([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 2MB as per API)
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 2MB.`);
        continue;
      }

      const attachment: FileAttachment = {
        file,
        type: getFileType(file.type),
      };

      // Create preview for images
      if (attachment.type === "image") {
        attachment.preview = URL.createObjectURL(file);
      }

      newAttachments.push(attachment);
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-(--header-bg) theme-header-bg px-4 py-2 shrink-0">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group shrink-0">
              {attachment.type === "image" && attachment.preview ? (
                <div className="relative">
                  <img src={attachment.preview} alt={attachment.file.name} className="w-20 h-20 object-cover rounded-lg"/>
                  <button type="button" onClick={() => removeAttachment(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-(--bg-input) px-3 py-2 rounded-lg">
                  {attachment.type === "video" ? (
                    <Video size={16} className="text-purple-500" />
                  ) : attachment.type === "audio" ? (
                    <Mic size={16} className="text-blue-500" />
                  ) : (
                    <File size={16} className="text-gray-500" />
                  )}
                  <span className="text-xs text-(--text-primary) max-w-24 truncate">
                    {attachment.file.name}
                  </span>
                  <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {/* File Attachment Button */}
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"/>
        <button
          type="button"
          onClick={openFilePicker}
          disabled={disabled || isSending}
          className="text-(--text-muted) hover:text-(--text-primary) p-1.5 rounded-full hover:bg-(--bg-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <Paperclip size={22} />
        </button>
        
        {/* Text Input */}
        <input 
          ref={inputRef}
          type="text" 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="flex-1 h-9 px-3 rounded-lg bg-(--bg-input) border border-gray-500 text-[14px] outline-none focus:ring-1 focus:ring-emerald-500/20 text-(--text-primary) placeholder:text-(--text-muted)"
        />
        
        {/* Send Button */}
        <button 
          onClick={handleSend} 
          disabled={disabled || isSending || (!inputText.trim() && attachments.length === 0)}
          className="text-(--accent-secondary) p-1.5 hover:bg-(--bg-hover) rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-(--accent-secondary) border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendHorizontal size={22} />
          )}
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
