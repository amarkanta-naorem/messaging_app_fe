"use client";

import ChatContext from "./ChatContext";
import { useAuth } from "./AuthContext";
import type { Conversation } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCallback, ReactNode, useEffect, useRef } from "react";
import { MessageContent, Message, sendMessage as sendMessageApi, sendFileMessage } from "@/lib/messages";
import { connectSocket, disconnectSocket, IncomingMessage, SocketError, MessagePayload, NewConversationEvent, MessageDeletePayload } from "@/lib/socket";
import { selectConversations, selectActiveConversationId, selectActiveConversation, selectMessagesForConversation, selectLoadingConversations, selectLoadingMessages, selectSendingMessage, selectSocketError } from "@/store/slices/chatSlice";
import { fetchConversations, fetchMessagesForConversation, setActiveConversation, switchConversation, addMessageOptimistic, updateMessageInState, replaceOptimisticMessage, addIncomingMessage, updateConversationLastMessage, removeMessage, markMessageDeletedForEveryone, setChatSocketError, addConversation } from "@/store/slices/chatSlice";

export function ChatProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, user } = useAuth();
  const conversations = useAppSelector(selectConversations);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const activeConversation = useAppSelector(selectActiveConversation);
  const loadingConversations = useAppSelector(selectLoadingConversations);
  const loadingMessages = useAppSelector(selectLoadingMessages);
  const sendingMessage = useAppSelector(selectSendingMessage);
  const socketError = useAppSelector(selectSocketError);
  const messages = useAppSelector(activeConversationId ? selectMessagesForConversation(activeConversationId) : () => []);
  const activeConversationRef = useRef<Conversation | null>(null);
  const handleNewMessageRef = useRef<((message: IncomingMessage) => void) | null>(null);
  const handleMessageErrorRef = useRef<((error: SocketError) => void) | null>(null);
  const handleSocketErrorRef = useRef<((error: SocketError) => void) | null>(null);
  const handleNewConversationRef = useRef<((event: NewConversationEvent) => void) | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    let socketCleanup: (() => void) | null = null;

    const setupSocket = async () => {
      try {
        const socket = await connectSocket(token);

        const handleConnectError = (error: Error) => {
          if (mounted) {
            dispatch(setChatSocketError(`Connection error: ${error.message}`));
          }
        };

        const handleConnect = () => {
          if (mounted) {
            dispatch(setChatSocketError(null));
          }
        };

        const handleMessageNew = (message: IncomingMessage) => {
          if (mounted && handleNewMessageRef.current) {
            handleNewMessageRef.current(message);
          }
        };

        const handleMessageNewDirect = (message: IncomingMessage) => {
          if (mounted && handleNewMessageRef.current) {
            handleNewMessageRef.current(message);
          }
        };

        const handleMessageError = (error: SocketError) => {
          if (mounted && handleMessageErrorRef.current) {
            handleMessageErrorRef.current(error);
          }
        };

        const handleSocketError = (error: SocketError) => {
          if (mounted && handleSocketErrorRef.current) {
            handleSocketErrorRef.current(error);
          }
        };

        const handleNewConversation = (event: NewConversationEvent) => {
          if (mounted && handleNewConversationRef.current) {
            handleNewConversationRef.current(event);
          }
        };

const handleMessageDelete = (payload: MessageDeletePayload) => {
          if (mounted) {
            const conversationId = payload.conversationId || payload.groupId!;
            dispatch(markMessageDeletedForEveryone({ conversationId, messageId: payload.messageId }));
          }
        };

        socket.on("connect_error", handleConnectError);
        socket.on("connect", handleConnect);
        socket.on("message:new", handleMessageNew);
        socket.on("newMessage", handleMessageNewDirect);
        socket.on("message:error", handleMessageError);
        socket.on("error", handleSocketError);
        socket.on("conversation:new", handleNewConversation);
        socket.on("message:delete", handleMessageDelete);

        socketCleanup = () => {
          socket.off("connect_error", handleConnectError);
          socket.off("connect", handleConnect);
          socket.off("message:new", handleMessageNew);
          socket.off("newMessage", handleMessageNewDirect);
          socket.off("message:error", handleMessageError);
          socket.off("error", handleSocketError);
          socket.off("conversation:new", handleNewConversation);
          socket.off("message:delete", handleMessageDelete);
        };

      } catch (err) {
        if (mounted) {
          dispatch(setChatSocketError("Failed to connect to chat server"));
        }
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (socketCleanup) {
        socketCleanup();
      }
      disconnectSocket();
    };
  }, [token, dispatch]);

  const normalizeMessageContent = useCallback((content: Message["content"] | IncomingMessage["content"]) => {
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && parsed.type) {
          return {
            ...parsed,
            type: parsed.type ?? "text",
            text: parsed.text ?? "",
          };
        }
      } catch {
        // If parsing fails, treat as plain text
      }
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

  const handleNewMessage = useCallback((message: IncomingMessage) => {
    const currentConv = activeConversationRef.current;
    const serverMessageId = message.serverMessageId ?? message.id;
    const normalizedContent = normalizeMessageContent(message.content);
    const isOwnMessage = message.senderId === user?.id;

    if (isOwnMessage) {
      if (message.groupId && currentConv && (currentConv as any).isGroup && currentConv.id === message.groupId) {
        (dispatch as any)(updateMessageInState({
          conversationId: currentConv.id,
          clientMessageId: message.clientMessageId!,
          updates: { id: serverMessageId ?? message.id, status: message.status }
        }));
      } else if (message.receiverId && currentConv && !(currentConv as any).isGroup && currentConv.participant?.id === message.receiverId) {
        (dispatch as any)(updateMessageInState({
          conversationId: currentConv.id,
          clientMessageId: message.clientMessageId!,
          updates: { id: serverMessageId ?? message.id, status: message.status }
        }));
      }
      return;
    }

    let resolvedConversationId: number | null = null;

    if (message.conversationId) {
      resolvedConversationId = message.conversationId;
    } else if (message.groupId) {
      resolvedConversationId = message.groupId;
    } else if (message.senderId) {
      const existingConv = conversations.find((conv) => conv.participant.id === message.senderId && !conv.isGroup);
      if (existingConv) {
        resolvedConversationId = existingConv.id;
      }
    }

    if (!resolvedConversationId) {
      return;
    }

    const normalizedMessage = { ...message, conversationId: resolvedConversationId, content: normalizedContent };

    (dispatch as any)(updateConversationLastMessage({
      conversationId: resolvedConversationId,
      lastMessage: {
        id: serverMessageId ?? message.id ?? Date.now(),
        content: normalizedContent,
        senderId: message.senderId,
        status: message.status,
        createdAt: String(message.createdAt) ?? new Date().toISOString(),
      },
    }));

    if (currentConv && resolvedConversationId === currentConv.id) {
      const exists = messages.some((msg) => (serverMessageId && msg.id === serverMessageId) || (message.clientMessageId && msg.clientMessageId === message.clientMessageId));
      if (!exists) {
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
  }, [normalizeMessageContent, user?.id, messages, dispatch, conversations]);

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

  const handleNewConversation = useCallback((event: NewConversationEvent) => {
    const { conversation, message } = event;
    if (conversation) {
      (dispatch as any)(addConversation(conversation));
      
      if (message) {
        const normalizedContent = normalizeMessageContent(message.content);
        const serverMessageId = message.serverMessageId ?? message.id;
        
        (dispatch as any)(addIncomingMessage({
          conversationId: conversation.id,
          message: {
            ...message,
            id: serverMessageId ?? message.id ?? Date.now(),
            content: normalizedContent,
            createdAt: message.createdAt ?? new Date().toISOString(),
          }
        }));
        
        (dispatch as any)(updateConversationLastMessage({
          conversationId: conversation.id,
          lastMessage: {
            id: serverMessageId ?? message.id ?? Date.now(),
            content: normalizedContent,
            senderId: message.senderId,
            status: message.status,
            createdAt: String(message.createdAt) ?? new Date().toISOString(),
          },
        }));

        if (activeConversationRef.current?.id === conversation.id) {
          (dispatch as any)(setActiveConversation(conversation));
        }
      }
    }
  }, [dispatch, normalizeMessageContent]);

  useEffect(() => {
    handleNewMessageRef.current = handleNewMessage;
  }, [handleNewMessage]);

  useEffect(() => {
    handleMessageErrorRef.current = handleMessageError;
  }, [handleMessageError]);

  useEffect(() => {
    handleSocketErrorRef.current = handleSocketError;
  }, [handleSocketError]);

  useEffect(() => {
    handleNewConversationRef.current = handleNewConversation;
  }, [handleNewConversation]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refreshConversations();
    }
  }, [user]);

  const selectConversation = useCallback(async (conversation: Conversation | null) => {
    if (conversation === null) {
      dispatch(switchConversation(null));
      return;
    }

    dispatch(switchConversation(conversation));
    
    const isGroup = (conversation as any).isGroup || conversation.type === 'group';
    (dispatch as any)(fetchMessagesForConversation({ conversationId: conversation.id, isGroup }));
  }, [dispatch]);

  const sendMessage = useCallback(
    (content: string | { type: string; text?: string; url?: string; caption?: string; task_list?: any[] }) => {
      if (!activeConversation || !user) return;

      const clientMessageId = crypto.randomUUID();
      const messageContent = typeof content === "string" ? { type: "text" as const, text: content } : content;
      const conversation = activeConversation as any;
      const isGroup = conversation.isGroup || conversation.type === 'group';

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
          (dispatch as any)(replaceOptimisticMessage({
            conversationId: activeConversation.id,
            clientMessageId,
            serverMessage: { ...optimisticMessage, id: apiResponse.id, status: apiResponse.status as Message["status"] }
          }));
          
          const normalizedContent = normalizeMessageContent(messageContent as any);
          (dispatch as any)(updateConversationLastMessage({
            conversationId: activeConversation.id,
            lastMessage: {
              id: apiResponse.id,
              content: normalizedContent,
              senderId: user.id,
              status: apiResponse.status as Message["status"],
              createdAt: String(optimisticMessage.createdAt),
            },
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

  const sendFile = useCallback(
    async (file: File, caption?: string) => {
      if (!activeConversation || !user) return;

      const clientMessageId = crypto.randomUUID();
      const conversation = activeConversation as any;
      const isGroup = conversation.isGroup || conversation.type === 'group';

      let fileType: string;
      if (file.type.startsWith("image/")) {
        fileType = "image";
      } else if (file.type.startsWith("video/")) {
        fileType = "video";
      } else if (file.type.startsWith("audio/")) {
        fileType = "audio";
      } else {
        fileType = "file";
      }

      const optimisticMessage: Message = {
        id: Date.now(),
        senderId: user.id,
        receiverId: isGroup ? undefined : activeConversation.participant?.id,
        groupId: isGroup ? activeConversation.id : undefined,
        conversationId: activeConversation.id,
        content: {
          type: fileType as any,
          file: {
            name: file.name,
            size: file.size,
            mimeType: file.type,
            url: URL.createObjectURL(file),
          },
          caption: caption || "",
        } as any,
        status: "sent",
        createdAt: new Date().toISOString(),
        clientMessageId,
      };

      (dispatch as any)(addMessageOptimistic({ 
        conversationId: activeConversation.id,
        message: optimisticMessage 
      }));

      try {
        const content = JSON.stringify({
          type: "file",
          caption: caption || "",
        });

        const payload: any = { clientMessageId, content, file };

        if (isGroup) {
          payload.groupId = conversation.id;
        } else {
          payload.receiverPhone = conversation.participant.phone;
        }

        const apiResponse = await sendFileMessage(payload);
        
        (dispatch as any)(replaceOptimisticMessage({
          conversationId: activeConversation.id,
          clientMessageId,
          serverMessage: { 
            ...optimisticMessage, 
            id: apiResponse.id, 
            status: apiResponse.status as Message["status"],
            content: apiResponse.content as unknown as MessageContent,
          }
        }));
        
        const normalizedContent = normalizeMessageContent(apiResponse.content as any);
        (dispatch as any)(updateConversationLastMessage({
          conversationId: activeConversation.id,
          lastMessage: {
            id: apiResponse.id,
            content: normalizedContent,
            senderId: user.id,
            status: apiResponse.status as Message["status"],
            createdAt: String(optimisticMessage.createdAt),
          },
        }));
      } catch (error: any) {
        console.error("Failed to send file:", error.message);
        (dispatch as any)(updateMessageInState({
          conversationId: activeConversation.id,
          clientMessageId,
          updates: { status: "failed" as const }
        }));
      }
    },
    [activeConversation, user, dispatch]
  );

  return (
    <ChatContext.Provider value={{ conversations, activeConversation, activeConversationId, messages, loadingConversations, loadingMessages, sendingMessage, socketError, selectConversation, sendMessage, sendFile, refreshConversations }}>
      {children}
    </ChatContext.Provider>
  );
}