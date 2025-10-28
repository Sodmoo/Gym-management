// models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, default: "" },
  imageUrl: { type: String, default: null },
  voiceUrl: { type: String, default: null },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", MessageSchema);
