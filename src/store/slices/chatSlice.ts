import type { Conversation, Message } from "@/types";
import { getConversations } from "@/lib/conversations";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getMessages as fetchMessages, sendMessage as sendMessageApi, MessageContent } from "@/lib/messages";

interface ChatState {
  conversations: Conversation[];
  messages: Record<number, Message[]>;
  activeConversationId: number | null;
  activeConversation: Conversation | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  conversationsError: string | null;
  messagesError: string | null;
  lastConversationFetchTime: number | null;
  lastMessagesFetchTime: Record<number, number>;
  socketError: string | null;
}

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
  
export const fetchConversations = createAsyncThunk("chat/fetchConversations", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const lastFetch = state.chat.lastConversationFetchTime;
    
    if (lastFetch && Date.now() - lastFetch < 1000) {
      return rejectWithValue("Debouncing: recent fetch already in progress");
    }
    
    const data = await getConversations();
    return { conversations: data, timestamp: Date.now() };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch conversations");
  }
});

export const fetchMessagesForConversation = createAsyncThunk("chat/fetchMessages", async ({ conversationId, isGroup }: { conversationId: number; isGroup: boolean }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const lastFetch = state.chat.lastMessagesFetchTime[conversationId];
    if (lastFetch && Date.now() - lastFetch < 500) {
      return rejectWithValue("Debouncing: recent fetch already in progress");
    }
    
    const data = await fetchMessages(conversationId, isGroup);
    const msgArray = Array.isArray(data) ? data : [];
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
    
    return { conversationId, messages: transformedMessages, timestamp: Date.now() };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch messages");
  }
});

interface SendMessageProps { 
  conversationId: number; 
  content: MessageContent | string; 
  isGroup: boolean;
  receiverPhone?: string;
  groupId?: number;
}

export const sendMessage = createAsyncThunk("chat/sendMessage", async ({ conversationId, content, isGroup, receiverPhone, groupId }: SendMessageProps, { rejectWithValue }) => {
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
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversationId: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload === null) {
        state.messagesError = null;
      }
    },
    
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
      state.activeConversationId = action.payload?.id || null;
      if (action.payload === null) {
        state.messagesError = null;
      }
    },

    addMessageOptimistic: (state, action: PayloadAction<{ conversationId: number; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    
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
    
    addIncomingMessage: (state, action: PayloadAction<{ conversationId: number; message: Message }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      const exists = state.messages[conversationId].some((msg) => msg.id === message.id || msg.clientMessageId === message.clientMessageId);
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },

    removeMessage: (state, action: PayloadAction<{ conversationId: number; messageId: number }>) => {
      const { conversationId, messageId } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        state.messages[conversationId] = messages.filter(msg => msg.id !== messageId);
      }
    },
    
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
    
    setChatSocketError: (state, action: PayloadAction<string | null>) => {
      state.socketError = action.payload;
    },
    
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
    
    clearConversationMessages: (state, action: PayloadAction<number>) => {
      delete state.messages[action.payload];
      delete state.lastMessagesFetchTime[action.payload];
    },
    
    clearActiveConversation: (state) => {
      state.activeConversationId = null;
      state.activeConversation = null;
    },
    
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const newConversation = action.payload;
      const exists = state.conversations.some((conv) => conv.id === newConversation.id);
      if (!exists) {
        state.conversations.unshift(newConversation);
      }
    },
    
    switchConversation: (state, action: PayloadAction<Conversation | null>) => {
      if (state.activeConversationId !== null) {
        delete state.messages[state.activeConversationId];
        delete state.lastMessagesFetchTime[state.activeConversationId];
      }
      
      state.activeConversation = action.payload;
      state.activeConversationId = action.payload?.id || null;
      state.messagesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchMessagesForConversation.pending, (state, action) => {
        state.loadingMessages = true;
        state.messagesError = null;
      })
      .addCase(fetchMessagesForConversation.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { conversationId, messages: newMessages, timestamp } = action.payload;
        const existingMessages = state.messages[conversationId] || [];
        const optimisticMessages = existingMessages.filter((msg) => msg.clientMessageId && !newMessages.some((newMsg: Message) => newMsg.clientMessageId === msg.clientMessageId || newMsg.id === msg.id));
        const mergedMessages = [...newMessages, ...optimisticMessages];
        const uniqueMessages = mergedMessages.reduce<Message[]>((acc, msg) => {
          const exists = acc.some((m) => (msg.id && m.id === msg.id) || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId));
          if (!exists) {
            acc.push(msg);
          }
          return acc;
        }, []);
        
        uniqueMessages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        state.messages[conversationId] = uniqueMessages;
        state.lastMessagesFetchTime[conversationId] = timestamp;
      })
      .addCase(fetchMessagesForConversation.rejected, (state, action) => {
        state.loadingMessages = false;
        state.messagesError = action.payload as string;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.sendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
      });
  },
});

export const selectChat = (state: { chat: ChatState }) => state.chat;
export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations;
export const selectActiveConversationId = (state: { chat: ChatState }) => state.chat.activeConversationId;
export const selectActiveConversation = (state: { chat: ChatState }) => {
  if (state.chat.activeConversation) {
    return state.chat.activeConversation;
  }
  const { conversations, activeConversationId } = state.chat;
  return activeConversationId !== null ? conversations.find((c) => c.id === activeConversationId) || null : null;
};
export const selectMessagesForConversation = (conversationId: number) => (state: { chat: ChatState }) => state.chat.messages[conversationId] || [];
export const selectLoadingConversations = (state: { chat: ChatState }) => state.chat.loadingConversations;
export const selectLoadingMessages = (state: { chat: ChatState }) => state.chat.loadingMessages;
export const selectSendingMessage = (state: { chat: ChatState }) => state.chat.sendingMessage;
export const selectConversationsError = (state: { chat: ChatState }) => state.chat.conversationsError;
export const selectMessagesError = (state: { chat: ChatState }) => state.chat.messagesError;
export const selectSocketError = (state: { chat: ChatState }) => state.chat.socketError;
export const { setActiveConversationId, setActiveConversation, switchConversation, addMessageOptimistic, updateMessageInState, replaceOptimisticMessage, addIncomingMessage, updateConversationLastMessage, removeMessage, setChatSocketError, clearAllChatState, clearConversationMessages, clearActiveConversation, addConversation } = chatSlice.actions;

export default chatSlice.reducer;
