/**
 * Enhanced Chat Slice with Redux Toolkit
 * Implements normalized state, async thunks, and proper lifecycle handling
 * Addresses: Stale state, race conditions, proper state reset on logout
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Conversation, Message } from "@/types";
import { getConversations } from "@/lib/conversations";
import { getMessages as fetchMessages, sendMessage as sendMessageApi, MessageContent } from "@/lib/messages";

// ── Types ──────────────────────────────────────────────────────────────────

interface ChatState {
  // Entity adapters for normalized state
  conversations: Conversation[];
  messages: Record<number, Message[]>; // conversationId -> messages
  
  // Active conversation
  activeConversationId: number | null;
  activeConversation: Conversation | null; // Full conversation object for direct access
  
  // Loading states
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  
  // Error states
  conversationsError: string | null;
  messagesError: string | null;
  
  // Request tracking for race condition prevention
  lastConversationFetchTime: number | null;
  lastMessagesFetchTime: Record<number, number>;
  
  // Socket error
  socketError: string | null;
}

// ── Initial State ───────────────────────────────────────────────────────

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  activeConversation: null,
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  conversationsError: null,
  messagesError: null,
  lastConversationFetchTime: null,
  lastMessagesFetchTime: {},
  socketError: null,
};

// ── Async Thunks ───────────────────────────────────────────────────────

/**
 * Fetch conversations with race condition prevention
 */
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const lastFetch = state.chat.lastConversationFetchTime;
      
      // Prevent rapid re-fetching (debounce)
      if (lastFetch && Date.now() - lastFetch < 1000) {
        return rejectWithValue("Debouncing: recent fetch already in progress");
      }
      
      const data = await getConversations();
      return { conversations: data, timestamp: Date.now() };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch conversations");
    }
  }
);

/**
 * Fetch messages for a specific conversation with race condition prevention
 */
export const fetchMessagesForConversation = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, isGroup }: { conversationId: number; isGroup: boolean }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const lastFetch = state.chat.lastMessagesFetchTime[conversationId];
      
      // Prevent rapid re-fetching
      if (lastFetch && Date.now() - lastFetch < 500) {
        return rejectWithValue("Debouncing: recent fetch already in progress");
      }
      
      const data = await fetchMessages(conversationId, isGroup);
      const msgArray = Array.isArray(data) ? data : [];
      
      // Transform messages - parse content if it's a string
      const transformedMessages = msgArray.map((msg: any) => {
        if (typeof msg.content === 'string') {
          try {
            return { ...msg, content: JSON.parse(msg.content) };
          } catch {
            return msg;
          }
        }
        return msg;
      });
      
      return { 
        conversationId, 
        messages: transformedMessages, 
        timestamp: Date.now() 
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  }
);

/**
 * Send a message with optimistic updates handled in the component
 */
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { 
      conversationId, 
      content, 
      isGroup, 
      receiverPhone,
      groupId 
    }: { 
      conversationId: number; 
      content: MessageContent | string; 
      isGroup: boolean;
      receiverPhone?: string;
      groupId?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = {
        content: typeof content === 'string' ? { type: "text", text: content } : content,
      };
      
      if (isGroup && groupId) {
        payload.groupId = groupId;
      } else if (receiverPhone) {
        payload.receiverPhone = receiverPhone;
      }
      
      const response = await sendMessageApi(payload);
      return { conversationId, message: response };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /**
     * Set active conversation by ID
     * This properly handles route-based state lifecycle
     */
    setActiveConversationId: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload === null) {
        // Clear messages when deselecting conversation
        state.messagesError = null;
      }
    },
    
    /**
     * Set active conversation directly with full object
     * This preserves the conversation data including participant info
     */
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
      state.activeConversationId = action.payload?.id || null;
      if (action.payload === null) {
        state.messagesError = null;
      }
    },
    
    /**
     * Add a message optimistically
     */
    addMessageOptimistic: (state, action: PayloadAction<{ conversationId: number; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    
    /**
     * Update a message (e.g., after optimistic update is confirmed)
     */
    updateMessageInState: (
      state,
      action: PayloadAction<{ 
        conversationId: number; 
        clientMessageId: string; 
        updates: Partial<Message> 
      }>
    ) => {
      const { conversationId, clientMessageId, updates } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const index = messages.findIndex((msg) => msg.clientMessageId === clientMessageId);
        if (index !== -1) {
          messages[index] = { ...messages[index], ...updates };
        }
      }
    },
    
    /**
     * Replace optimistic message with server response
     */
    replaceOptimisticMessage: (
      state,
      action: PayloadAction<{ 
        conversationId: number; 
        clientMessageId: string; 
        serverMessage: Message 
      }>
    ) => {
      const { conversationId, clientMessageId, serverMessage } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const index = messages.findIndex((msg) => msg.clientMessageId === clientMessageId);
        if (index !== -1) {
          messages[index] = serverMessage;
        }
      }
    },
    
    /**
     * Add incoming message from WebSocket
     */
    addIncomingMessage: (state, action: PayloadAction<{ conversationId: number; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check for duplicate
      const exists = state.messages[conversationId].some(
        (msg) => msg.id === message.id || msg.clientMessageId === message.clientMessageId
      );
      
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },
    
    /**
     * Update conversation's last message (from WebSocket)
     */
    updateConversationLastMessage: (
      state,
      action: PayloadAction<{
        conversationId: number;
        lastMessage: Conversation["lastMessage"];
        unreadCount?: number;
      }>
    ) => {
      const { conversationId, lastMessage, unreadCount } = action.payload;
      const index = state.conversations.findIndex((conv) => conv.id === conversationId);
      if (index !== -1) {
        state.conversations[index].lastMessage = lastMessage;
        if (unreadCount !== undefined) {
          state.conversations[index].unreadCount = unreadCount;
        }
      }
    },
    
    /**
     * Set socket error
     */
    setChatSocketError: (state, action: PayloadAction<string | null>) => {
      state.socketError = action.payload;
    },
    
    /**
     * CRITICAL: Clear ALL chat state
     * This MUST be called on logout to prevent session leakage
     */
    clearAllChatState: (state) => {
      state.conversations = [];
      state.messages = {};
      state.activeConversationId = null;
      state.loadingConversations = false;
      state.loadingMessages = false;
      state.sendingMessage = false;
      state.conversationsError = null;
      state.messagesError = null;
      state.lastConversationFetchTime = null;
      state.lastMessagesFetchTime = {};
      state.socketError = null;
    },
    
    /**
     * Clear messages for a specific conversation (when leaving chat route)
     */
    clearConversationMessages: (state, action: PayloadAction<number>) => {
      delete state.messages[action.payload];
      delete state.lastMessagesFetchTime[action.payload];
    },
    
    /**
     * Clear active conversation (when navigating away)
     */
    clearActiveConversation: (state) => {
      state.activeConversationId = null;
      state.activeConversation = null;
    },
    
    /**
     * Add a new conversation from WebSocket (real-time sync)
     */
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const newConversation = action.payload;
      // Check if conversation already exists
      const exists = state.conversations.some((conv) => conv.id === newConversation.id);
      if (!exists) {
        // Add to the beginning of the list (most recent first)
        state.conversations.unshift(newConversation);
      }
    },
    
    /**
     * Switch conversation - clear previous messages and set new active conversation
     */
    switchConversation: (state, action: PayloadAction<Conversation | null>) => {
      // Clear messages for the previous conversation to prevent stale data
      if (state.activeConversationId !== null) {
        delete state.messages[state.activeConversationId];
        delete state.lastMessagesFetchTime[state.activeConversationId];
      }
      
      // Set new active conversation
      state.activeConversation = action.payload;
      state.activeConversationId = action.payload?.id || null;
      state.messagesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loadingConversations = true;
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload.conversations;
        state.lastConversationFetchTime = action.payload.timestamp;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.conversationsError = action.payload as string;
      })
      
      // Fetch Messages
      .addCase(fetchMessagesForConversation.pending, (state, action) => {
        state.loadingMessages = true;
        state.messagesError = null;
        // Don't clear existing messages yet - wait for success
      })
      .addCase(fetchMessagesForConversation.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { conversationId, messages: newMessages, timestamp } = action.payload;
        
        // Get existing messages for this conversation
        const existingMessages = state.messages[conversationId] || [];
        
        // Preserve optimistic messages (messages with clientMessageId that haven't been confirmed)
        const optimisticMessages = existingMessages.filter(
          (msg) => msg.clientMessageId && !newMessages.some((newMsg: Message) => 
            newMsg.clientMessageId === msg.clientMessageId || newMsg.id === msg.id
          )
        );
        
        // Merge: new messages from API + preserved optimistic messages
        const mergedMessages = [...newMessages, ...optimisticMessages];
        
        // Remove duplicates based on id or clientMessageId
        const uniqueMessages = mergedMessages.reduce<Message[]>((acc, msg) => {
          const exists = acc.some(
            (m) => (msg.id && m.id === msg.id) || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId)
          );
          if (!exists) {
            acc.push(msg);
          }
          return acc;
        }, []);
        
        // Sort by createdAt to maintain chronological order
        uniqueMessages.sort((a: Message, b: Message) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        state.messages[conversationId] = uniqueMessages;
        state.lastMessagesFetchTime[conversationId] = timestamp;
      })
      .addCase(fetchMessagesForConversation.rejected, (state, action) => {
        state.loadingMessages = false;
        state.messagesError = action.payload as string;
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.sendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        // Error is handled in the component for now
      });
  },
});

// ── Selectors ──────────────────────────────────────────────────────────

export const selectChat = (state: { chat: ChatState }) => state.chat;
export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations;
export const selectActiveConversationId = (state: { chat: ChatState }) => state.chat.activeConversationId;
export const selectActiveConversation = (state: { chat: ChatState }) => {
  // First check if we have a directly stored active conversation (with full participant data)
  if (state.chat.activeConversation) {
    return state.chat.activeConversation;
  }
  // Fallback: look up from conversations array
  const { conversations, activeConversationId } = state.chat;
  return activeConversationId !== null 
    ? conversations.find((c) => c.id === activeConversationId) || null 
    : null;
};
export const selectMessagesForConversation = (conversationId: number) => (state: { chat: ChatState }) => 
  state.chat.messages[conversationId] || [];
export const selectLoadingConversations = (state: { chat: ChatState }) => state.chat.loadingConversations;
export const selectLoadingMessages = (state: { chat: ChatState }) => state.chat.loadingMessages;
export const selectSendingMessage = (state: { chat: ChatState }) => state.chat.sendingMessage;
export const selectConversationsError = (state: { chat: ChatState }) => state.chat.conversationsError;
export const selectMessagesError = (state: { chat: ChatState }) => state.chat.messagesError;
export const selectSocketError = (state: { chat: ChatState }) => state.chat.socketError;

// ── Exports ─────────────────────────────────────────────────────────────

export const {
  setActiveConversationId,
  setActiveConversation,
  switchConversation,
  addMessageOptimistic,
  updateMessageInState,
  replaceOptimisticMessage,
  addIncomingMessage,
  updateConversationLastMessage,
  setChatSocketError,
  clearAllChatState,
  clearConversationMessages,
  clearActiveConversation,
  addConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
