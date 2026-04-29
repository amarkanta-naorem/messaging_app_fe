"use client";

import { createContext, useContext } from "react";
import type { Conversation, Message as ChatMessage } from "@/types";

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: number | null;
  messages: ChatMessage[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  socketError: string | null;
  selectConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string | { type: string; text?: string; url?: string; caption?: string; task_list?: { sortOrder: number; title: string; isCompleted: boolean; status: string; }[] }) => void;
  sendFile: (file: File, caption?: string) => Promise<void>;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export default ChatContext;
