// routes/chat.route.js (updated: + upload route with Multer)
import express from "express";
import multer from "multer"; // npm install multer
import path from "path";
import fs from "fs"; // For dir check
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createOrGetRoom,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp3|wav|mp4|pdf/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (mimeOk && extOk) return cb(null, true);
    cb(new Error("Invalid file type: Images, audio, video, PDF only"));
  },
});

// Routes
router.post("/room", verifyToken, createOrGetRoom);
router.get("/messages/:roomId", verifyToken, getMessages);
router.post("/message", verifyToken, sendMessage);

// NEW: Upload attachment (image/voice/file)
router.post(
  "/upload",
  verifyToken,
  upload.single("attachment"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        url: fileUrl,
        type: req.file.mimetype,
        originalName: req.file.originalname,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
