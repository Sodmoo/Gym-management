// controllers/chatController.js (updated: fixed io import, enhanced populate, error logging)
import ChatRoom from "../models/ChatRoom.model.js";
import Message from "../models/Message.model.js";

// Create or get ChatRoom
export const createOrGetRoom = async (req, res) => {
  try {
    const { memberId } = req.body;
    const trainerId = req.user._id;

    if (!memberId || !trainerId) {
      return res.status(400).json({ message: "Missing memberId or trainerId" });
    }

    let room = await ChatRoom.findOne({
      members: { $all: [trainerId, memberId] },
    }).populate("members", "name username profileImage");

    if (!room) {
      room = await ChatRoom.create({ members: [trainerId, memberId] });
      room = await ChatRoom.findById(room._id).populate(
        "members",
        "name username profileImage"
      ); // Re-populate after create
    }

    res.json(room);
  } catch (err) {
    console.error("createOrGetRoom error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get ChatRoom messages
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ chatRoomId: roomId })
      .populate("senderId", "name username profileImage")
      .populate({
        path: "replyTo",
        populate: { path: "senderId", select: "name username profileImage" },
        select: "text createdAt",
      })
      .sort({ createdAt: 1 })
      .limit(50); // Adjust as needed
    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message (REST fallback; Socket preferred for real-time)
export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, text, imageUrl, voiceUrl, replyTo } = req.body;
    const senderId = req.user._id;

    if (!chatRoomId || (!text && !imageUrl && !voiceUrl)) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const message = await Message.create({
      chatRoomId,
      senderId,
      text,
      imageUrl,
      voiceUrl,
      replyTo: replyTo || null,
    });

    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    // Emit via Socket.IO
    const { io } = await import("../index.js"); // Fixed path: adjust if server.js is in root
    io.to(chatRoomId).emit("newMessage", message);

    res.json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
