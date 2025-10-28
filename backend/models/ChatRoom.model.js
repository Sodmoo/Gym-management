// models/ChatRoom.js
import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatRoom", ChatRoomSchema);
