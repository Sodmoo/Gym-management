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
  addmeasurement,
  editmeasurement,
  deleteMeasurement,
  getMeasurements,
  addGoal,
  editGoal,
  deleteGoal,
  getGoalsByMember,
  getMeasurementsByMember,
} from "../controllers/trainer.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createPlan,
  deletePlan,
  editPlan,
  getPlan,
  getPlansByMember,
  getPlansByTrainer,
} from "../controllers/plan.controller.js";

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

router.post("/createPlan", verifyToken, createPlan);
router.delete("/deletePlan/:id", verifyToken, deletePlan);
router.put("/editPlan/:id", verifyToken, editPlan);
router.get("/getPlan/:id", verifyToken, getPlan);
router.get("/getPlanM/:memberId", verifyToken, getPlansByMember);
router.get("/getPlanT/:trainerId", verifyToken, getPlansByTrainer);

router.post("/addMeasurement", verifyToken, addmeasurement);
router.put("/updateMeasurement/:id", verifyToken, editmeasurement);
router.delete("/deleteMeasurement/:id", verifyToken, deleteMeasurement);
router.get("/getMeasurement/:id", verifyToken, getMeasurements);

router.post("/addGoal", verifyToken, addGoal);
router.put("/updateGoal/:id", verifyToken, editGoal);
router.delete("/deleteGoal/:id", verifyToken, deleteGoal);
router.get("/getGoals/:memberId", verifyToken, getGoalsByMember);

export default router;
