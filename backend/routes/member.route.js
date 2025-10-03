import express from "express";
import { allMember } from "../controllers/user.controller.js";
import {
  addSubGoal,
  updateProgress,
  deleteSubGoal,
  memberinfo,
} from "../controllers/member.controller.js";

const router = express.Router();

router.get("/me", memberinfo);
router.get("/allmember", allMember);
router.post("/:id/subgoals", addSubGoal);
router.put("/:memberId/subgoals/:subGoalId/progress", updateProgress);
router.delete("/:memberId/subgoals/:subGoalId/delete", deleteSubGoal);

export default router;
