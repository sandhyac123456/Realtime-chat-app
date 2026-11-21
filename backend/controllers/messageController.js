const Message = require("../models/message");
const Chat = require("../models/chat");

const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user.id;

    if (!chatId || !text || !text.trim()) {
      return res.status(400).json({ message: "Chat ID and text are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isParticipant = chat.participants.some(
      (id) => id.toString() === senderId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    const newMessage = await Message.create({
      chat: chatId,
      sender: senderId,
      text: text.trim(),
    });

    chat.latestMessage = newMessage._id;
    await chat.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email profilePic")
      .populate({
        path: "chat",
        select: "participants latestMessage",
      });

      const io = req.app.get("io");
    if (io) {
      io.to(chatId.toString()).emit("messageReceived", populatedMessage);
    }

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isParticipant = chat.participants.some(
      (id) => id.toString() === currentUserId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email profilePic")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Messages fetched successfully",
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendMessage, getMessages };