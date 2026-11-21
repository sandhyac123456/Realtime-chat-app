const { Server } = require("socket.io");
const User = require("../models/user");

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected via socket:", socket.id);

    socket.on("setup", async (userId) => {
      if (!userId) return;

      socket.userId = userId;
      onlineUsers.set(userId, socket.id);

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      } catch (err) {
        console.error("Error setting user online:", err.message);
      }
    });

    // User kisi chat room mein join karta hai
    socket.on("joinChat", (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
    });

    // Naya message aane par room ke baaki members ko bhejna
    socket.on("newMessage", (messageData) => {
      const chatId = messageData?.chat?._id || messageData?.chat;
      if (!chatId) return;

      socket.to(chatId).emit("messageReceived", messageData);
    });

    // Disconnect hone par user ko offline mark karna
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        try {
          await User.findByIdAndUpdate(userId, { isOnline: false });
          io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        } catch (err) {
          console.error("Error setting user offline:", err.message);
        }
      }
    });
  });

  return io;
};

module.exports = initSocket;