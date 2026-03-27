"use client";

import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { ChatEmptyState } from "./ChatEmptyState";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { ContactDrawer } from "../employee/contact-drawer";

interface FileAttachment {
  file: File;
  preview?: string;
  type: "image" | "video" | "audio" | "document";
}

export default function ChatView() {
  const { user } = useAuth();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeConversation, messages, loadingMessages, sendMessage, sendFile, selectConversation, sendingMessage } = useChat();
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConversation?.id]);

  const handleSend = async (text: string, attachments?: FileAttachment[], contentType?: string, taskList?: any[], taskTitle?: string) => {
    if (activeConversation) {
      setIsSending(true);
      try {
        // If there are attachments, send them as file messages
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            await sendFile(attachment.file, text || undefined);
          }
        } else if (contentType === "task" && taskList && taskList.length > 0) {
          // Send task message
          const content = {
            type: "task",
            task_title: taskTitle || undefined,
            task_list: taskList,
          };
          sendMessage(content);
        } else if (text.trim()) {
          // Send text-only message
          sendMessage(text);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsSending(false);
      }
      inputRef.current?.focus();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseChat = () => {
    selectConversation(null as any);
  };

  // Empty state when no conversation is selected
  if (!activeConversation) {
    return <ChatEmptyState />;
  }

  const isGroup = (activeConversation as any).isGroup;

  return (
    <div className="flex flex-col h-full bg-(--chat-bg) theme-chat-bg" onContextMenu={handleContextMenu}>
      {/* Chat Background */}
      {isDark ? (
        <>
          <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/image/chat-bg.png')", opacity: 0.18 }}/>
          <div className="absolute inset-0 z-0 bg-linear-to-b from-black/40 to-black/20" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/image/chat-bg.png')", opacity: 0.3 }}/>
          <div className="absolute inset-0 z-0 bg-linear-to-b from-white/50 to-white/20" />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <ChatHeader
          participant={activeConversation.participant}
          isGroup={isGroup}
          onProfileClick={() => setShowContactDrawer(true)}
          onSearchClick={() => {}}
          onMoreClick={() => {}}
        />

        {/* Messages */}
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          isGroup={isGroup}
          loading={loadingMessages}
        />

        {/* Input */}
        <MessageInput 
          onSend={handleSend} 
          isSending={isSending || sendingMessage}
        />
        
        {/* Context Menu */}
        {contextMenu && (
          <div className="fixed bg-(--bg-card) shadow-lg p-2 z-100 rounded-lg" style={{ top: contextMenu.y, left: contextMenu.x }}>
            <button className="block w-full text-left px-3 py-2 text-sm hover:bg-(--bg-hover) rounded text-(--text-primary)" onClick={handleCloseChat}>Close chat</button>
          </div>
        )}
        
        {/* Contact Drawer */}
        {showContactDrawer && (
          <ContactDrawer
            isOpen={showContactDrawer}
            onClose={() => setShowContactDrawer(false)}
            conversation={activeConversation}
          />
        )}
      </div>
    </div>
  );
}
