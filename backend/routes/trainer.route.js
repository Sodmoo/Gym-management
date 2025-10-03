import express from "express";
import {
  assignStudentToTrainer,
  removeStudentFromTrainer,
  trainerConfirm,
  trainerReject,
  getTrainerById,
  trainers,
} from "../controllers/trainer.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/trainers", verifyToken, trainers);
router.post("/assign-student", assignStudentToTrainer);
router.post("/remove-student", removeStudentFromTrainer);
router.put("/trainer_confirm/:id", verifyToken, trainerConfirm);
router.put("/trainer_reject/:id", verifyToken, trainerReject);
router.get("/trainer/:id", getTrainerById);

export default router;
