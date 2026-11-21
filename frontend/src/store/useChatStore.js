import { create } from "zustand";
import api from "../api/api";

export const useChatStore = create((set, get) => ({
  users: [],
  chats: [],
  selectedChat: null,
  messages: [],
  onlineUsers: [],
  loadingUsers: false,
  loadingChats: false,
  loadingMessages: false,
  creatingChat: false,
  sendingMessage: false,
  error: null,

  setOnlineUsers: (userIds) =>
    set({ onlineUsers: Array.isArray(userIds) ? userIds : [] }),

  fetchUsers: async () => {
    set({ loadingUsers: true, error: null });
    try {
      const res = await api.get("/user/all-users");
      set({ users: res.data.users || [], loadingUsers: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load users",
        loadingUsers: false,
      });
    }
  },

  fetchChats: async () => {
    set({ loadingChats: true, error: null });
    try {
      const res = await api.get("/chat/my-chats");
      set({ chats: res.data.chats || res.data || [], loadingChats: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load chats",
        loadingChats: false,
      });
    }
  },

  accessOrCreateChat: async (targetUserId) => {
    set({ creatingChat: true, error: null });
    try {
      const res = await api.post("/chat/create", { userId: targetUserId });
      const chat = res.data.chat || res.data;
      const existingChats = get().chats;

      const alreadyInList = existingChats.some((c) => c._id === chat._id);
      const updatedChats = alreadyInList
        ? existingChats
        : [chat, ...existingChats];

      set({
        chats: updatedChats,
        selectedChat: chat,
        creatingChat: false,
      });

      if (chat?._id) {
        get().fetchMessages(chat._id);
      }
      return chat;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to start chat",
        creatingChat: false,
      });
      return null;
    }
  },

  setSelectedChat: (chat) => {
    set({ selectedChat: chat, messages: [] });
    if (chat?._id) {
      get().fetchMessages(chat._id);
    }
  },

  fetchMessages: async (chatId) => {
    if (!chatId) return;
    set({ loadingMessages: true, error: null });
    try {
      const res = await api.get(`/message/${chatId}`);
      const list = res.data.messages || res.data || [];
      set({ messages: Array.isArray(list) ? list : [], loadingMessages: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load messages",
        loadingMessages: false,
      });
    }
  },

  sendMessage: async (chatId, text) => {
    const trimmed = text?.trim();
    if (!chatId || !trimmed) return null;

    set({ sendingMessage: true, error: null });
    try {
      const res = await api.post("/message/send", { chatId, text: trimmed });
      const newMsg = res.data.message || res.data;

      set((state) => {
        const alreadyInMessages =
          newMsg?._id &&
          state.messages.some((m) => m._id && String(m._id) === String(newMsg._id));

        return {
          messages: alreadyInMessages
            ? state.messages
            : [...state.messages, newMsg],
          chats: state.chats.map((c) =>
            String(c._id) === String(chatId)
              ? { ...c, latestMessage: newMsg }
              : c
          ),
          selectedChat:
            String(state.selectedChat?._id) === String(chatId)
              ? { ...state.selectedChat, latestMessage: newMsg }
              : state.selectedChat,
          sendingMessage: false,
        };
      });

      return newMsg;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to send message",
        sendingMessage: false,
      });
      return null;
    }
  },

  receiveMessage: (incomingMsg) => {
    if (!incomingMsg) return;
    const msgChatId = String(incomingMsg.chat?._id || incomingMsg.chat || "");
    const currentSelectedId = String(get().selectedChat?._id || "");
    const incomingId = incomingMsg._id ? String(incomingMsg._id) : null;

    set((state) => {
      const isCurrentChat = Boolean(msgChatId && msgChatId === currentSelectedId);
      const alreadyExists = incomingId
        ? state.messages.some((m) => m._id && String(m._id) === incomingId)
        : false;

      return {
        messages:
          isCurrentChat && !alreadyExists
            ? [...state.messages, incomingMsg]
            : state.messages,
        chats: state.chats.map((c) =>
          String(c._id) === msgChatId ? { ...c, latestMessage: incomingMsg } : c
        ),
      };
    });
  },

  resetChatState: () =>
    set({
      users: [],
      chats: [],
      selectedChat: null,
      messages: [],
      onlineUsers: [],
      error: null,
    }),
}));