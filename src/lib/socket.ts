import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let cachedSocketUrl: string | null = null;

async function getSocketUrl(): Promise<string> {
  if (cachedSocketUrl) return cachedSocketUrl;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("/api/config/socket", { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    cachedSocketUrl = data.socketUrl;
    return cachedSocketUrl!;
  } catch (error) {
    console.warn("Failed to fetch socket URL, using default:", error);
    return "http://localhost:3001";
  }
}

export interface MessageContent {
  type: "text" | "image" | "video" | "audio" | "document";
  text?: string;
  url?: string;
  caption?: string;
}

export interface MessagePayload {
  clientMessageId: string;
  receiverId?: number;
  groupId?: number;
  content: MessageContent;
}

export interface IncomingMessage {
  id: number;
  serverMessageId?: number;
  clientMessageId: string;
  conversationId?: number;
  groupId?: number;
  senderId: number;
  senderName?: string;
  receiverId: number;
  content: MessageContent;
  status: "sent" | "delivered" | "read" | "failed";
  createdAt: string | number | null;
}

export interface DeliveryAck {
  messageId: number;
  clientMessageId: string;
  status: "delivered" | "stored";
}

export interface SocketError {
  code: string;
  message: string;
  clientMessageId?: string;
}

export interface MessageDeletePayload {
  messageId: number;
  conversationId?: number;
  groupId?: number;
}

export async function connectSocket(token: string): Promise<Socket> {
  const socketUrl = await getSocketUrl();
  
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(socketUrl, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    if (socket && (socket as any).io?.reconnectionAttempts) {
      const attempts = (socket as any).io.reconnectionAttempts;
      if (attempts >= 5) {
        console.error("Max reconnection attempts reached");
        socket.disconnect();
      }
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function sendMessage(payload: MessagePayload, callback?: (response: DeliveryAck | SocketError) => void): void {
  if (socket?.connected) {
    socket.emit("message:send", payload, callback);
  } else {
    callback?.({
      code: "NOT_CONNECTED",
      message: "Socket not connected",
      clientMessageId: payload.clientMessageId,
    });
  }
}

export function onNewMessage(callback: (message: IncomingMessage) => void): void {
  socket?.on("message:new", callback);
}

export function offNewMessage(callback: (message: IncomingMessage) => void): void {
  socket?.off("message:new", callback);
}

export function onMessageError(callback: (error: SocketError) => void): void {
  socket?.on("message:error", callback);
}

export function offMessageError(callback: (error: SocketError) => void): void {
  socket?.off("message:error", callback);
}

export function onError(callback: (error: SocketError) => void): void {
  socket?.on("error", callback);
}

export function offError(callback: (error: SocketError) => void): void {
  socket?.off("error", callback);
}

export function onMessageDelete(callback: (payload: MessageDeletePayload) => void): void {
  socket?.on("message:delete", callback);
}

export function offMessageDelete(callback: (payload: MessageDeletePayload) => void): void {
  socket?.off("message:delete", callback);
}

export interface NewConversationEvent {
  conversation: {
    id: number;
    participant: {
      id: number;
      name: string;
      phone: string;
      avatar: string | null;
    };
    isGroup?: boolean;
    type?: string;
    name?: string;
    lastMessage: {
      id: number;
      content: any;
      senderId: number;
      status: string;
      createdAt: string;
    } | null;
    unreadCount: number;
    createdAt?: string;
    updatedAt?: string;
  };
  message?: IncomingMessage;
}

export function onNewConversation(callback: (event: NewConversationEvent) => void): void {
  socket?.on("conversation:new", callback);
}

export function offNewConversation(callback: (event: NewConversationEvent) => void): void {
  socket?.off("conversation:new", callback);
}
