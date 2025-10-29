// server.js (Updated: + CORS headers for /uploads to fix image loading from frontend)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./db/connect.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import equipmentRoute from "./routes/equipment.route.js";
import membershipTypeRoute from "./routes/membershipType.route.js";
import trainerRoute from "./routes/trainer.route.js";
import memberRoute from "./routes/member.route.js";
import scheduleRoute from "./routes/schedule.route.js";
import chatRoute from "./routes/chat.route.js";

import "./controllers/membership_helper/membership.cron.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// In-memory user status (scale to Redis/DB later)
const userStatus = new Map();

// Socket.IO events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let currentUserId = null;

  // NEW: Track user join for status
  socket.on("user-joined", (userId) => {
    currentUserId = userId;
    socket.userId = userId;
    userStatus.set(userId, { isActive: true, lastSeen: new Date(), rooms: [] });
    console.log(`User ${userId} joined and is active`);
    io.emit("status-update", { userId, isActive: true }); // Broadcast globally or to rooms
  });

  const updateLastSeen = (userId) => {
    if (userStatus.has(userId)) {
      userStatus.get(userId).lastSeen = new Date();
      userStatus.get(userId).isActive = true;
    }
  };

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (currentUserId) {
      updateLastSeen(currentUserId);
      const status = userStatus.get(currentUserId);
      if (status && !status.rooms.includes(roomId)) status.rooms.push(roomId);
    }
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("typing", ({ roomId, senderId }) => {
    updateLastSeen(senderId);
    socket.to(roomId).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ roomId }) => {
    socket.to(roomId).emit("stopTyping");
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { chatRoomId, senderId, text, imageUrl, voiceUrl, replyTo } = data;
      updateLastSeen(senderId); // Mark active

      const { default: Message } = await import("./models/Message.model.js");
      const { default: ChatRoom } = await import("./models/ChatRoom.model.js");

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

      // Emit to room (including sender for consistency)
      io.to(chatRoomId).emit("newMessage", message);
    } catch (err) {
      console.error("Socket sendMessage error:", err);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    if (currentUserId) {
      userStatus.set(currentUserId, {
        ...userStatus.get(currentUserId),
        isActive: false,
        lastSeen: new Date(),
      });
      io.emit("status-update", { userId: currentUserId, isActive: false });
      console.log(`User ${currentUserId} disconnected and is inactive`);
    }
    console.log("User disconnected:", socket.id);
  });

  // NEW: Heartbeat to detect inactivity (every 30s, 5-min threshold)
  const heartbeat = setInterval(() => {
    if (!currentUserId) return;
    const now = new Date();
    const status = userStatus.get(currentUserId);
    if (status?.isActive && now - status.lastSeen > 5 * 60 * 1000) {
      status.isActive = false;
      io.emit("status-update", { userId: currentUserId, isActive: false });
      console.log(`User ${currentUserId} marked inactive (timeout)`);
    }
  }, 30000);

  // Clean up interval on disconnect
  socket.on("disconnect", () => clearInterval(heartbeat));
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/equipment", equipmentRoute);
app.use("/api/trainers", trainerRoute);
app.use("/api/members", memberRoute);
app.use("/api/schedules", scheduleRoute);
app.use("/api/chat", chatRoute);
app.use("/api/membership-types", membershipTypeRoute);

// FIXED: Add CORS headers to /uploads for cross-port image/audio loads
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Frontend origin
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  },
  express.static("uploads")
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  await connectDB();
  console.log("Server running on port:", PORT);
});
