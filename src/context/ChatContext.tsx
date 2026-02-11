"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { useAuth } from "./AuthContext";
import { Conversation, getConversations } from "@/lib/conversations";
import { Message, getMessages } from "@/lib/messages";
import { connectSocket, disconnectSocket, sendMessage as socketSendMessage, onNewMessage, offNewMessage, onMessageError, offMessageError, onError, offError, IncomingMessage, SocketError } from "@/lib/socket";

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  socketError: string | null;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (text: string) => void;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const activeConversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on("connect_error", (error) => {
      setSocketError(`Connection error: ${error.message}`);
    });

    socket.on("connect", () => {
      setSocketError(null);
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);

  const normalizeMessageContent = useCallback((content: Message["content"] | IncomingMessage["content"]) => {
    if (typeof content === "string") {
      return { type: "text" as const, text: content };
    }

    const text = content.text ?? content.value ?? "";
    return {
      ...content,
      type: content.type ?? "text",
      text,
    };
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await getConversations();
      setConversations(data.conversations);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const resolveConversationId = useCallback(async (message: IncomingMessage): Promise<number | null> => {
    if (typeof message.conversationId === "number") {
      return message.conversationId;
    }

    if (!message.senderId || message.senderId === user?.id) {
      return null;
    }

    try {
      const data = await getConversations();
      const match = data.conversations.find((conv) => conv.participant.id === message.senderId);
      if (match) {
        setConversations(data.conversations);
        return match.id;
      }
      setConversations(data.conversations);
    } catch (err) {
      console.error("Failed to resolve conversation:", err);
    }

    return null;
  }, [user?.id]);

  const handleNewMessage = useCallback((message: IncomingMessage) => {
    const currentConv = activeConversationRef.current;
    const serverMessageId = message.serverMessageId ?? message.id;
    const normalizedContent = normalizeMessageContent(message.content);

    void (async () => {
      const resolvedConversationId = await resolveConversationId(message);

      if (resolvedConversationId === null) {
        return;
      }

      const normalizedMessage = {
        ...message,
        conversationId: resolvedConversationId,
        content: normalizedContent,
      };

      if (currentConv && resolvedConversationId === currentConv.id) {
        setMessages((prev) => {
          let replaced = false;
          const nextMessages = prev.map((msg) => {
            if (message.clientMessageId && msg.clientMessageId === message.clientMessageId) {
              replaced = true;
              return { ...msg, ...normalizedMessage, id: serverMessageId ?? msg.id };
            }
            return msg;
          });

          if (replaced) return nextMessages;

          if (serverMessageId && prev.some((msg) => msg.id === serverMessageId)) {
            return prev;
          }
          return [...prev, { ...normalizedMessage, id: serverMessageId ?? message.id ?? Date.now() }];
        });
      }

      setConversations((prev) => {
        const conversationExists = prev.some((conv) => conv.id === resolvedConversationId);

        if (conversationExists) {
          return prev.map((conv) =>
            conv.id === resolvedConversationId
              ? {
                  ...conv,
                  lastMessage: {
                    id: serverMessageId ?? message.id ?? Date.now(),
                    content: normalizedContent,
                    senderId: message.senderId,
                    status: message.status,
                    createdAt: message.createdAt,
                  },
                  unreadCount: currentConv?.id === resolvedConversationId ? conv.unreadCount : conv.unreadCount + 1,
                }
              : conv
          );
        }

        refreshConversations();
        return prev;
      });
    })();
  }, [normalizeMessageContent, refreshConversations, resolveConversationId]);

  const handleMessageError = useCallback((error: SocketError) => {
    if (error.clientMessageId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.clientMessageId === error.clientMessageId
            ? { ...msg, status: "sent" as const }
            : msg
        )
      );
    }
    console.error("Message error:", error.code, error.message);
  }, []);

  const handleSocketError = useCallback((error: SocketError) => {
    if (error.code === "UNAUTHORIZED") {
      setSocketError("Authentication failed. Please log in again.");
      disconnectSocket();
    } else {
      setSocketError(error.message);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    onNewMessage(handleNewMessage);
    onMessageError(handleMessageError);
    onError(handleSocketError);

    return () => {
      offNewMessage(handleNewMessage);
      offMessageError(handleMessageError);
      offError(handleSocketError);
    };
  }, [token, handleNewMessage, handleMessageError, handleSocketError]);

  useEffect(() => {
    if (user) {
      refreshConversations();
    }
  }, [user, refreshConversations]);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setLoadingMessages(true);
    try {
      const msgs = await getMessages(conversation.id);
      setMessages(msgs.map((msg) => ({
        ...msg,
        content: normalizeMessageContent(msg.content),
      })));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [normalizeMessageContent]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!activeConversation || !user) return;

      const clientMessageId = crypto.randomUUID();

      const optimisticMessage: Message = {
        id: Date.now(),
        senderId: user.id,
        receiverId: activeConversation.participant.id,
        conversationId: activeConversation.id,
        content: { type: "text", text },
        status: "sent",
        createdAt: new Date().toISOString(),
        clientMessageId,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      socketSendMessage(
        {
          clientMessageId,
          receiverId: activeConversation.participant.id,
          content: { type: "text", text },
        },
        (response) => {
          if ("code" in response) {
            setMessages((prev) =>
              prev.filter((msg) => msg.clientMessageId !== clientMessageId)
            );
            console.error("Send failed:", response.message);
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.clientMessageId === clientMessageId
                  ? { ...msg, id: response.messageId, status: response.status }
                  : msg
              )
            );
          }
        }
      );
    },
    [activeConversation, user]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        socketError,
        selectConversation,
        sendMessage,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
