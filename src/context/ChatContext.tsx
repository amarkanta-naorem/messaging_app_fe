"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { useAuth } from "./AuthContext";
import { Conversation, getConversations } from "@/lib/conversations";
import { Message, getMessages, MessageContent, sendMessage as sendMessageApi } from "@/lib/messages";
import { connectSocket, disconnectSocket, sendMessage as socketSendMessage, onNewMessage, offNewMessage, onMessageError, offMessageError, onError, offError, IncomingMessage, SocketError } from "@/lib/socket";

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  socketError: string | null;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (content: string | { type: string; text?: string; url?: string; caption?: string }) => void;
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

    const text = content.text ?? "";
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
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const resolveConversationId = useCallback(async (message: IncomingMessage): Promise<number | null> => {
    // If message already has conversationId, use it
    if (typeof message.conversationId === "number") {
      return message.conversationId;
    }

    // Handle group messages - match by groupId
    if (message.groupId) {
      const currentConv = activeConversationRef.current;
      if (currentConv && (currentConv as any).isGroup && currentConv.id === message.groupId) {
        return message.groupId;
      }
      // For group messages, we need to find the conversation with matching groupId
      try {
        const data = await getConversations();
        const groupConv = data.find((conv) => (conv as any).isGroup && conv.id === message.groupId);
        if (groupConv) {
          setConversations(data);
          return groupConv.id;
        }
        setConversations(data);
      } catch (err) {
        console.error("Failed to resolve group conversation:", err);
      }
      return null;
    }

    // Handle direct messages - match by senderId to participant
    if (!message.senderId || message.senderId === user?.id) {
      return null;
    }

    try {
      const data = await getConversations();
      const match = data.find((conv) => conv.participant.id === message.senderId);
      if (match) {
        setConversations(data);
        return match.id;
      }
      setConversations(data);
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
      const isOwnMessage = message.senderId === user?.id;
      
      // For sender's own messages, we still need to resolve the conversation for deduplication
      // but we don't need to show notifications or update unread counts
      const resolvedConversationId = await resolveConversationId(message);

      // Skip if we couldn't resolve and it's not our own message
      if (resolvedConversationId === null && !isOwnMessage) {
        return;
      }

      // For own messages, we need to find the conversation to do deduplication
      if (resolvedConversationId === null && isOwnMessage) {
        // Try to find the conversation by groupId or from conversations list
        if (message.groupId && currentConv && (currentConv as any).isGroup && currentConv.id === message.groupId) {
          // This is our own group message - do deduplication only
          setMessages((prev: any) => {
            const nextMessages = prev.map((msg: any) => {
              if (message.clientMessageId && msg.clientMessageId === message.clientMessageId) {
                return { ...msg, id: serverMessageId ?? msg.id, status: message.status };
              }
              return msg;
            });
            return nextMessages;
          });
          return;
        }
        return;
      }

      const normalizedMessage = {
        ...message,
        conversationId: resolvedConversationId,
        content: normalizedContent,
      };

      if (currentConv && resolvedConversationId === currentConv.id) {
        setMessages((prev: any) => {
          // First, try to replace by clientMessageId (deduplication)
          let replaced = false;
          const nextMessages = prev.map((msg: any) => {
            if (message.clientMessageId && msg.clientMessageId === message.clientMessageId) {
              replaced = true;
              return { ...msg, ...normalizedMessage, id: serverMessageId ?? msg.id, status: message.status };
            }
            return msg;
          });

          if (replaced) return nextMessages;

          // Check for duplicate by serverMessageId
          if (serverMessageId && prev.some((msg: any) => msg.id === serverMessageId)) {
            return prev;
          }
          
          // Don't add own messages again - they were already added optimistically
          if (isOwnMessage) {
            return prev;
          }

          return [...prev, { ...normalizedMessage, id: serverMessageId ?? message.id ?? Date.now() }];
        });
      }

      // Update conversations list - only for other users' messages
      if (!isOwnMessage) {
        setConversations((prev: any) => {
          const conversationExists = prev.some((conv: any) => conv.id === resolvedConversationId);

          if (conversationExists) {
            return prev.map((conv: any) =>
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
      }
    })();
  }, [normalizeMessageContent, refreshConversations, resolveConversationId, user?.id]);

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
    const isGroup = (conversation as any).isGroup || conversation.type === 'group';
    try {
      const msgs = await getMessages(conversation.id, isGroup);
      // Add groupId to messages for group conversations to ensure consistency with WebSocket
      setMessages(msgs.map((msg) => ({
        ...msg,
        groupId: isGroup ? conversation.id : msg.groupId,
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
    (content: string | { type: string; text?: string; url?: string; caption?: string }) => {
      if (!activeConversation || !user) return;

      const clientMessageId = crypto.randomUUID();

      const messageContent = typeof content === "string" 
        ? { type: "text" as const, text: content } 
        : content;

      const conversation = activeConversation as any;
      const isGroup = conversation.isGroup || conversation.type === 'group';

      const optimisticMessage: Message = {
        id: Date.now(),
        senderId: user.id,
        receiverId: isGroup ? undefined : activeConversation.participant.id,
        groupId: isGroup ? activeConversation.id : undefined,
        conversationId: activeConversation.id,
        content: messageContent as MessageContent,
        status: "sent",
        createdAt: new Date().toISOString(),
        clientMessageId,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      const payload: any = {
        clientMessageId,
        content: messageContent,
      };

      if (isGroup) {
        payload.groupId = conversation.id;
      } else {
        payload.receiverId = conversation.participant.id;
      }

      // Use REST API for group messages, WebSocket for direct messages
      if (isGroup) {
        // Use REST API for group messages
        sendMessageApi(payload)
          .then((response) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.clientMessageId === clientMessageId
                  ? { ...msg, id: response.id, status: response.status as Message["status"] }
                  : msg
              )
            );
          })
          .catch((error) => {
            console.error("Send failed:", error.message);
            setMessages((prev) =>
              prev.filter((msg) => msg.clientMessageId !== clientMessageId)
            );
          });
      } else {
        // Use WebSocket for direct messages
        socketSendMessage(
          payload,
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
      }
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
