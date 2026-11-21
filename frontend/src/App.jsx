import { useEffect } from "react";
import AuthForm from "./components/AuthForm";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { socket } from "./api/socket";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";

export default function App() {
  const { user, logout } = useAuthStore();
  const currentUserId = user?._id || user?.id;

  const {
    selectedChat,
    setOnlineUsers,
    receiveMessage,
    resetChatState,
  } = useChatStore();

  useEffect(() => {
    if (!currentUserId) return;

    const handleConnect = () => {
      socket.emit("setup", currentUserId);
      const activeChatId = useChatStore.getState().selectedChat?._id;
      if (activeChatId) {
        socket.emit("joinChat", activeChatId);
      }
    };

    const handleOnlineUsers = (usersList) => {
      setOnlineUsers(usersList);
    };

    const handleMessageReceived = (msg) => {
      receiveMessage(msg);
    };

    socket.on("connect", handleConnect);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("messageReceived", handleMessageReceived);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("messageReceived", handleMessageReceived);
      socket.disconnect();
    };
  }, [currentUserId, setOnlineUsers, receiveMessage]);

  useEffect(() => {
    if (selectedChat?._id && socket.connected) {
      socket.emit("joinChat", selectedChat._id);
    }
  }, [selectedChat?._id]);

  if (!user) {
    return <AuthForm />;
  }

  const displayName = user.name || user.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    socket.disconnect();
    resetChatState();
    logout();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 via-indigo-50/40 to-violet-50/50 text-slate-900 overflow-hidden select-none">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-[0_1px_12px_-4px_rgba(15,23,42,0.08)] z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center text-sm shadow-md shadow-indigo-500/25 ring-1 ring-white/40">
              {initial}
            </div>
            <span
              title="Online"
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm tracking-tight truncate">
                {displayName}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            {user.email && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-flex items-center rounded-xl bg-slate-100/90 px-3 py-1 text-[11px] font-medium text-slate-500 border border-slate-200/70">
            Real-Time Workspace
          </span>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50/90 text-slate-700 hover:text-rose-600 hover:border-rose-200 px-3.5 py-1.5 text-xs sm:text-sm font-medium shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`${selectedChat ? "hidden md:flex" : "flex"} h-full`}>
          <ChatSidebar />
        </div>
        <ChatWindow />
      </div>
    </div>
  );
}