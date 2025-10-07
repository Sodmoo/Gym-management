import express from "express";
import {
  assignStudentToTrainer,
  removeStudentFromTrainer,
  trainerConfirm,
  trainerReject,
  getTrainerById,
  trainers,
  assignedStudents,
  templateWorkout,
  workoutTemplates,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  templateDiet,
  dietTemplates,
  updateDietTemplate,
  deleteDietemplate,
} from "../controllers/trainer.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/trainers", verifyToken, trainers);
router.post("/assign-student", assignStudentToTrainer);
router.post("/remove-student", removeStudentFromTrainer);
router.put("/trainer_confirm/:id", verifyToken, trainerConfirm);
router.put("/trainer_reject/:id", verifyToken, trainerReject);
router.get("/trainer/:id", getTrainerById);

router.get("/assigned-students/:id", verifyToken, assignedStudents);

router.post("/createTemplate-workout", verifyToken, templateWorkout);
router.get("/workout-templates/:id", verifyToken, workoutTemplates);
router.put("/updatetemplate-workout/:id", verifyToken, updateWorkoutTemplate);
router.delete(
  "/deletetemplate-workout/:id",
  verifyToken,
  deleteWorkoutTemplate
);

router.post("/createTemplate-diet", verifyToken, templateDiet);
router.get("/diet-templates/:id", verifyToken, dietTemplates);
router.put("/updatetemplate-diet/:id", verifyToken, updateDietTemplate);
router.delete("/deletetemplate-diet/:id", verifyToken, deleteDietemplate);

export default router;
