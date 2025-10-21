import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createSchedule,
  deleteSchedule,
  getAllSchedules,
  getSchedulesByTrainer,
  getTodaySchedules,
  markScheduleComplete,
  updateSchedule,
} from "../controllers/trainer.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createSchedule);
router.get("/:id", verifyToken, getSchedulesByTrainer);
router.put("/:id", verifyToken, updateSchedule);
router.get("/trainer/:trainerId/today", verifyToken, getTodaySchedules);
router.delete("/:id", verifyToken, deleteSchedule);

router.get("/getAllSchedules", verifyToken, getAllSchedules);
router.patch("/:id/complete", verifyToken, markScheduleComplete);

export default router;
