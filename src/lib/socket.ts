/**
 * Socket service - client-side WebSocket communication.
 * 
 * SECURITY: The socket URL is now fetched from the server (BFF pattern)
 * to prevent exposing the backend URL in the browser's network tab.
 */

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let cachedSocketUrl: string | null = null;

/**
 * Fetch the socket URL from the server (BFF).
 * This keeps the backend URL hidden from the client.
 * Includes timeout to prevent hanging.
 */
async function getSocketUrl(): Promise<string> {
  if (cachedSocketUrl) return cachedSocketUrl;
  
  try {
    // Add timeout controller to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch("/api/config/socket", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    cachedSocketUrl = data.socketUrl;
    console.log("Socket URL fetched:", cachedSocketUrl);
    return cachedSocketUrl!;
  } catch (error) {
    // Fallback for development - in production this should never happen
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
    // Limit reconnection attempts to prevent infinite loading
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    // Add timeout for initial connection
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
    // Don't retry indefinitely - give up after max attempts
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
