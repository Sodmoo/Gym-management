// models/ChatRoom.model.js (updated with indexes for performance)
import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
ChatRoomSchema.index({ members: 1 });
ChatRoomSchema.index({ updatedAt: -1 });

export default mongoose.model("ChatRoom", ChatRoomSchema);
