const Chat = require("../models/chat");
const User = require("../models/user");

const createChat = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "Cannot create chat with yourself" });
    }

    const targetUser = await User.findById(userId).select("_id");
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 },
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name email profilePic" },
      });

    if (existingChat) {
      return res.status(200).json({
        message: "Chat already exists",
        chat: existingChat,
      });
    }

    const createdChat = await Chat.create({
      participants: [currentUserId, userId],
    });

    const fullChat = await Chat.findById(createdChat._id).populate(
      "participants",
      "-password"
    );

    return res.status(201).json({
      message: "Chat created successfully",
      chat: fullChat,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const chats = await Chat.find({
      participants: currentUserId,
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name email profilePic" },
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      message: "Chats fetched successfully",
      chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createChat, getMyChats };