import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ChatSidebar() {
  const [tab, setTab] = useState("chats"); // "chats" | "users"
  const [search, setSearch] = useState("");
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const {
    users,
    chats,
    selectedChat,
    onlineUsers,
    loadingUsers,
    loadingChats,
    creatingChat,
    fetchUsers,
    fetchChats,
    accessOrCreateChat,
    setSelectedChat,
  } = useChatStore();

  useEffect(() => {
    fetchChats();
    fetchUsers();
  }, [fetchChats, fetchUsers]);

  const getOtherParticipant = (chat) => {
    if (!Array.isArray(chat?.participants)) return null;
    return (
      chat.participants.find((p) => (p._id || p) !== currentUserId) || null
    );
  };

  const query = search.trim().toLowerCase();

  const filteredChats = chats.filter((chat) => {
    if (!query) return true;
    const other = getOtherParticipant(chat);
    const title = (other?.name || other?.email || "").toLowerCase();
    const lastMsg = (chat.latestMessage?.text || "").toLowerCase();
    return title.includes(query) || lastMsg.includes(query);
  });

  const filteredUsers = users.filter((u) => {
    if (!query) return true;
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <aside className="w-full md:w-84 shrink-0 bg-white/85 backdrop-blur-md border-r border-slate-200/80 flex flex-col h-full">
      {/* Tabs & Search */}
      <div className="p-3.5 border-b border-slate-200/70 space-y-3 bg-white/60">
        <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/60 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setTab("chats")}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "chats"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
            }`}
          >
            <span>Chats</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                tab === "chats"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {chats.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "users"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
            }`}
          >
            <span>Users</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                tab === "users"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {users.length}
            </span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "chats" ? "Search conversations..." : "Search people..."
            }
            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {tab === "chats" ? (
          loadingChats ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">Loading chats...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200/80 mx-1 mt-2">
              <p className="text-sm font-semibold text-slate-700">
                {search ? "No matching chats" : "No chats yet"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {search
                  ? "Try another name or message keyword"
                  : "Switch to Users tab to start a conversation"}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const other = getOtherParticipant(chat);
              const otherId = other?._id || other;
              const isOtherOnline = otherId
                ? onlineUsers.includes(otherId)
                : false;
              const title = other?.name || other?.email || "Conversation";
              const isActive = selectedChat?._id === chat._id;
              const lastMsgText =
                chat.latestMessage?.text || "No messages yet";

              return (
                <button
                  key={chat._id}
                  type="button"
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50/95 to-violet-50/80 border border-indigo-200/90 shadow-2xs"
                      : "hover:bg-slate-50/90 border border-transparent hover:border-slate-200/60"
                  }`}
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0 ring-1 ring-indigo-200/60">
                    {title.charAt(0).toUpperCase()}
                    {isOtherOnline && (
                      <span
                        title="Online"
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-2xs"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isActive ? "text-indigo-950" : "text-slate-800"
                        }`}
                      >
                        {title}
                      </p>
                      {isOtherOnline && (
                        <span className="text-[10px] font-medium text-emerald-600 shrink-0">
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMsgText}
                    </p>
                  </div>
                </button>
              );
            })
          )
        ) : loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-10">
            {search ? "No matching users" : "No other users found"}
          </p>
        ) : (
          filteredUsers.map((u) => {
            const label = u.name || u.email;
            const isUserOnline = onlineUsers.includes(u._id);

            return (
              <button
                key={u._id}
                type="button"
                disabled={creatingChat}
                onClick={async () => {
                  const chat = await accessOrCreateChat(u._id);
                  if (chat) setTab("chats");
                }}
                className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/90 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer disabled:opacity-60 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 font-semibold flex items-center justify-center shrink-0 ring-1 ring-slate-200/80">
                    {label.charAt(0).toUpperCase()}
                    {isUserOnline && (
                      <span
                        title="Online"
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-2xs"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {u.email}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50/90 group-hover:bg-indigo-600 group-hover:text-white px-2.5 py-1 rounded-xl transition-all shrink-0">
                  Chat
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}