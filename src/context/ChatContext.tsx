/**
 * Chat Context
 * Uses Redux for state management with proper lifecycle handling
 */

"use client";

import { createContext, useContext, useCallback, ReactNode, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { getConversations } from "@/lib/conversations";
import { MessageContent, sendMessage as sendMessageApi } from "@/lib/messages";
import { connectSocket, disconnectSocket, IncomingMessage, SocketError, MessagePayload, getSocket } from "@/lib/socket";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  fetchConversations,
  fetchMessagesForConversation,
  setActiveConversation,
  addMessageOptimistic,
  updateMessageInState,
  replaceOptimisticMessage,
  addIncomingMessage,
  updateConversationLastMessage,
  setChatSocketError,
  selectConversations,
  selectActiveConversationId,
  selectActiveConversation,
  selectMessagesForConversation,
  selectLoadingConversations,
  selectLoadingMessages,
  selectSendingMessage,
  selectSocketError,
} from "@/store/store";
import type { Conversation, Message } from "@/types";

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: number | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  socketError: string | null;
  selectConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string | { type: string; text?: string; url?: string; caption?: string }) => void;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, user } = useAuth();
  
  // Redux selectors
  const conversations = useAppSelector(selectConversations);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const activeConversation = useAppSelector(selectActiveConversation);
  const loadingConversations = useAppSelector(selectLoadingConversations);
  const loadingMessages = useAppSelector(selectLoadingMessages);
  const sendingMessage = useAppSelector(selectSendingMessage);
  const socketError = useAppSelector(selectSocketError);
  
  // Get messages for active conversation
  const messages = useAppSelector(activeConversationId ? selectMessagesForConversation(activeConversationId) : () => []);
  
  const activeConversationRef = useRef<Conversation | null>(null);
  
  // Refs for callbacks to use in socket event handlers
  const handleNewMessageRef = useRef<((message: IncomingMessage) => void) | null>(null);
  const handleMessageErrorRef = useRef<((error: SocketError) => void) | null>(null);
  const handleSocketErrorRef = useRef<((error: SocketError) => void) | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const setupSocket = async () => {
      try {
        const socket = await connectSocket(token);

        socket.on("connect_error", (error: Error) => {
          if (mounted) {
            dispatch(setChatSocketError(`Connection error: ${error.message}`));
          }
        });

        socket.on("connect", () => {
          if (mounted) {
            dispatch(setChatSocketError(null));
          }
        });
        
        socket.on("message:new", (message: IncomingMessage) => {
          console.log("Received message:new event:", message);
          if (handleNewMessageRef.current) {
            handleNewMessageRef.current(message);
          }
        });

        socket.on("message:error", (error: SocketError) => {
          console.log("Received message:error event:", error);
          if (handleMessageErrorRef.current) {
            handleMessageErrorRef.current(error);
          }
        });

        socket.on("error", (error: SocketError) => {
          console.log("Received error event:", error);
          if (handleSocketErrorRef.current) {
            handleSocketErrorRef.current(error);
          }
        });
      } catch (err) {
        if (mounted) {
          dispatch(setChatSocketError("Failed to connect to chat server"));
        }
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      const socket = getSocket();
      if (socket) {
        socket.off("message:new");
        socket.off("message:error");
        socket.off("error");
      }
      disconnectSocket();
    };
  }, [token, dispatch]);

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

  const refreshConversations = useCallback(() => {
    if (user) {
      (dispatch as any)(fetchConversations());
    }
  }, [user, dispatch]);

  const resolveConversationId = useCallback(async (message: IncomingMessage): Promise<number | null> => {
    if (typeof message.conversationId === "number") {
      return message.conversationId;
    }

    if (message.groupId) {
      const currentConv = activeConversationRef.current;
      if (currentConv && (currentConv as any).isGroup && currentConv.id === message.groupId) {
        return message.groupId;
      }
      try {
        const data = await getConversations();
        const groupConv = data.find((conv) => (conv as any).isGroup && conv.id === message.groupId);
        if (groupConv) {
          (dispatch as any)({ type: "chat/setConversations", payload: data });
          return groupConv.id;
        }
        (dispatch as any)({ type: "chat/setConversations", payload: data });
      } catch (err) {
        console.error("Failed to resolve group conversation:", err);
      }
      return null;
    }

    if (!message.senderId || message.senderId === user?.id) {
      return null;
    }

    try {
      const data = await getConversations();
      const match = data.find((conv) => conv.participant.id === message.senderId);
      if (match) {
        (dispatch as any)({ type: "chat/setConversations", payload: data });
        return match.id;
      }
      (dispatch as any)({ type: "chat/setConversations", payload: data });
    } catch (err) {
      console.error("Failed to resolve conversation:", err);
    }

    return null;
  }, [user?.id, dispatch]);

  const handleNewMessage = useCallback((message: IncomingMessage) => {
    const currentConv = activeConversationRef.current;
    const serverMessageId = message.serverMessageId ?? message.id;
    const normalizedContent = normalizeMessageContent(message.content);

    void (async () => {
      const isOwnMessage = message.senderId === user?.id;
      const resolvedConversationId = await resolveConversationId(message);

      if (resolvedConversationId === null && !isOwnMessage) {
        console.log("Could not resolve conversation for message:", message);
        return;
      }

      if (resolvedConversationId === null && isOwnMessage) {
        if (message.groupId && currentConv && (currentConv as any).isGroup && currentConv.id === message.groupId) {
          (dispatch as any)(updateMessageInState({
            conversationId: currentConv.id,
            clientMessageId: message.clientMessageId!,
            updates: { id: serverMessageId ?? message.id, status: message.status }
          }));
          return;
        }
        return;
      }

      const normalizedMessage = {
        ...message,
        conversationId: resolvedConversationId ?? undefined,
        content: normalizedContent,
      };

      if (currentConv && resolvedConversationId === currentConv.id) {
        let replaced = false;
        
        const existingIndex = messages.findIndex((msg) => 
          message.clientMessageId && msg.clientMessageId === message.clientMessageId
        );
        
        if (existingIndex !== -1) {
          replaced = true;
          (dispatch as any)(updateMessageInState({
            conversationId: currentConv.id,
            clientMessageId: message.clientMessageId,
            updates: { 
              ...normalizedMessage, 
              id: serverMessageId ?? message.id, 
              status: message.status,
              createdAt: normalizedMessage.createdAt ?? new Date().toISOString()
            }
          }));
        }

        if (!replaced && serverMessageId && messages.some((msg) => msg.id === serverMessageId)) {
          return;
        }
        
        if (!replaced && !isOwnMessage) {
          (dispatch as any)(addIncomingMessage({ 
            conversationId: currentConv.id,
            message: { 
              ...normalizedMessage, 
              id: serverMessageId ?? message.id ?? Date.now(),
              createdAt: normalizedMessage.createdAt ?? new Date().toISOString()
            }
          }));
        }
      }

      if (!isOwnMessage) {
        (dispatch as any)(updateConversationLastMessage({
          conversationId: resolvedConversationId!,
          lastMessage: {
            id: serverMessageId ?? message.id ?? Date.now(),
            content: normalizedContent,
            senderId: message.senderId,
            status: message.status,
            createdAt: String(message.createdAt) ?? new Date().toISOString(),
          },
          unreadCount: currentConv?.id === resolvedConversationId ? 0 : undefined,
        }));
      }
    })();
  }, [normalizeMessageContent, resolveConversationId, user?.id, messages, dispatch]);

  const handleMessageError = useCallback((error: SocketError) => {
    if (error.clientMessageId && activeConversationId) {
      (dispatch as any)(updateMessageInState({
        conversationId: activeConversationId,
        clientMessageId: error.clientMessageId,
        updates: { status: "failed" as const }
      }));
    }
    console.error("Message error:", error.code, error.message);
  }, [activeConversationId, dispatch]);

  const handleSocketError = useCallback((error: SocketError) => {
    if (error.code === "UNAUTHORIZED") {
      dispatch(setChatSocketError("Authentication failed. Please log in again."));
      disconnectSocket();
    } else {
      dispatch(setChatSocketError(error.message));
    }
  }, [dispatch]);

  useEffect(() => {
    handleNewMessageRef.current = handleNewMessage;
  }, [handleNewMessage]);

  useEffect(() => {
    handleMessageErrorRef.current = handleMessageError;
  }, [handleMessageError]);

  useEffect(() => {
    handleSocketErrorRef.current = handleSocketError;
  }, [handleSocketError]);

  // Only fetch conversations once when user is available
  // This effect runs only on initial mount to prevent duplicate fetching
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refreshConversations();
    }
  }, [user]);

  const selectConversation = useCallback(async (conversation: Conversation | null) => {
    if (conversation === null) {
      dispatch(setActiveConversation(null));
      return;
    }

    // Store the full conversation object to preserve participant data
    dispatch(setActiveConversation(conversation));
    
    const isGroup = (conversation as any).isGroup || conversation.type === 'group';
    (dispatch as any)(fetchMessagesForConversation({ conversationId: conversation.id, isGroup }));
  }, [dispatch]);

  const sendMessage = useCallback(
    (content: string | { type: string; text?: string; url?: string; caption?: string }) => {
      if (!activeConversation || !user) return;

      const clientMessageId = crypto.randomUUID();

      const messageContent = typeof content === "string" ? { type: "text" as const, text: content } : content;

      const conversation = activeConversation as any;
      const isGroup = conversation.isGroup || conversation.type === 'group';

      console.log("Conversation info:", {
        id: conversation.id,
        isGroup,
        participantId: conversation.participant?.id,
        participant: conversation.participant
      });

      const optimisticMessage: Message = {
        id: Date.now(),
        senderId: user.id,
        receiverId: isGroup ? undefined : activeConversation.participant?.id,
        groupId: isGroup ? activeConversation.id : undefined,
        conversationId: activeConversation.id,
        content: messageContent as MessageContent,
        status: "sent",
        createdAt: new Date().toISOString(),
        clientMessageId,
      };

      (dispatch as any)(addMessageOptimistic({ 
        conversationId: activeConversation.id,
        message: optimisticMessage 
      }));

      const payload: MessagePayload = {
        clientMessageId,
        content: messageContent as MessagePayload["content"],
      };

      if (isGroup) {
        payload.groupId = conversation.id;
      } else {
        payload.receiverId = conversation.participant.id;
      }

      console.log("Sending message via WebSocket:", payload);
      console.log("Socket connected:", getSocket()?.connected);

      const restPayload: any = {
        content: payload.content,
        clientMessageId: payload.clientMessageId,
      };
      if (isGroup) {
        restPayload.groupId = payload.groupId;
      } else {
        restPayload.receiverPhone = conversation.participant.phone;
      }
      
      sendMessageApi(restPayload)
        .then((apiResponse) => {
          console.log("REST API response:", apiResponse);
          (dispatch as any)(replaceOptimisticMessage({
            conversationId: activeConversation.id,
            clientMessageId,
            serverMessage: { ...optimisticMessage, id: apiResponse.id, status: apiResponse.status as Message["status"] }
          }));
        })
        .catch((error) => {
          console.error("REST API failed:", error.message);
          (dispatch as any)(updateMessageInState({
            conversationId: activeConversation.id,
            clientMessageId,
            updates: { status: "failed" as const }
          }));
        });
    },
    [activeConversation, user, dispatch]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        messages,
        loadingConversations,
        loadingMessages,
        sendingMessage,
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

export default ChatContext;
