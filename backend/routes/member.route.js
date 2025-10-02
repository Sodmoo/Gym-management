import express from "express";
import { allMember } from "../controllers/user.controller.js";
import {
  addSubGoal,
  updateProgress,
  deleteSubGoal,
} from "../controllers/member.controller.js";

const router = express.Router();

router.get("/allmember", allMember);
router.post("/:id/subgoals", addSubGoal);
router.patch("/:memberId/subgoals/:subGoalId", updateProgress);
router.delete("/:memberId/subgoals/:subGoalId", deleteSubGoal);

export default router;
