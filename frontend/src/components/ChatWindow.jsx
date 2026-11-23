import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ChatWindow() {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const {
    selectedChat,
    messages,
    onlineUsers,
    loadingMessages,
    sendingMessage,
    sendMessage,
    setSelectedChat,
  } = useChatStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat?._id]);

  if (!selectedChat) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-white/45 backdrop-blur-xs p-6 text-center">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50">
          💬
        </div>
        <p className="text-base font-semibold text-slate-900 tracking-tight">
          Select a conversation
        </p>
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
          Start Chat with anyone in your friend list!
        </p>
      </main>
    );
  }

  const otherUser = Array.isArray(selectedChat.participants)
    ? selectedChat.participants.find((p) => (p._id || p) !== currentUserId)
    : null;

  const partnerId = otherUser?._id || otherUser;
  const isPartnerOnline = partnerId ? onlineUsers.includes(partnerId) : false;
  const partnerName = otherUser?.name || otherUser?.email || "Conversation";
  const partnerInitial = partnerName.charAt(0).toUpperCase();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sendingMessage) return;

    const sent = await sendMessage(selectedChat._id, text);
    if (sent) {
      setText("");
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-slate-50/60 h-full overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSelectedChat(null)}
            className="md:hidden rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Back
          </button>

          <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0 ring-1 ring-indigo-200/70">
            {partnerInitial}
            {isPartnerOnline && (
              <span
                title="Online"
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-2xs"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">
                {partnerName}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                  isPartnerOnline
                    ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
                    : "bg-slate-100 text-slate-500 ring-slate-200/80"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPartnerOnline ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {isPartnerOnline ? "Online" : "Offline"}
              </span>
            </div>
            {otherUser?.email && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {otherUser.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3.5 bg-[radial-gradient(#cbd5e1_0.75px,transparent_0.75px)] [background-size:18px_18px]">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 px-6 py-5 shadow-xs">
              <p className="text-sm font-semibold text-slate-700">
                No messages yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                   Start Chat with {partnerName}!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMine = senderId === currentUserId;
            const msgText = msg.text || msg.content || "";

            return (
              <div
                key={msg._id || idx}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm transition-all ${
                    isMine
                      ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-br-md shadow-md shadow-indigo-500/20"
                      : "bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/80 rounded-bl-md shadow-xs"
                  }`}
                >
                  <p className="break-words leading-relaxed">{msgText}</p>
                  {msg.createdAt && (
                    <p
                      className={`text-[10px] mt-1 font-medium ${
                        isMine
                          ? "text-indigo-100/90 text-right"
                          : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSend}
        className="bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-3 sm:px-5 py-3 flex items-center gap-2.5 shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${partnerName}...`}
          className="flex-1 rounded-2xl border border-slate-200/90 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendingMessage}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {sendingMessage ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
}