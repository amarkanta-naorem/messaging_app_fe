import { io, Socket } from "socket.io-client";
import { API_BASE } from "./config";

const SOCKET_URL = API_BASE.replace("/api", "");

let socket: Socket | null = null;

export interface MessageContent {
  type: "text" | "image" | "video" | "audio" | "document";
  text?: string;
  url?: string;
  caption?: string;
}

export interface MessagePayload {
  clientMessageId: string;
  receiverId: number;
  content: MessageContent;
}

export interface IncomingMessage {
  id: number;
  serverMessageId?: number;
  clientMessageId: string;
  conversationId?: number;
  senderId: number;
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

export function connectSocket(token: string): Socket {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
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
