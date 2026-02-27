/**
 * MessageInput - Input component for typing and sending messages.
 */

import { useState, useRef, KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  /** Callback when send button is clicked or Enter is pressed */
  onSend: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
}: MessageInputProps) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || disabled) return;
    
    onSend(text);
    setInputText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-14 bg-(--header-bg) theme-header-bg px-4 flex items-center gap-2 shrink-0">
      <input 
        ref={inputRef}
        type="text" 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)} 
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-9 px-3 rounded-2xl bg-(--bg-input) border border-gray-300 text-[14px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-(--text-primary) placeholder:text-(--text-muted)"
      />
      <button 
        onClick={handleSend} 
        disabled={disabled || !inputText.trim()}
        className="text-(--accent-secondary) p-1 hover:bg-(--bg-hover) rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SendHorizontal size={24} />
      </button>
    </div>
  );
}

export default MessageInput;
