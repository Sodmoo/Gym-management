import express from "express";
import {
  assignStudentToTrainer,
  removeStudentFromTrainer,
} from "../controllers/trainer.controller.js";

const router = express.Router();

router.post("/assign-student", assignStudentToTrainer);
router.post("/remove-student", removeStudentFromTrainer);

export default router;
