import express from "express";
import {
  alltrainer,
  alluser,
  deleteUser,
  updateUser,
  userinfo,
  trainerConfirm,
  trainerReject,
  allMember,
  getTrainerById,
} from "../controllers/user.controller.js";
import { register } from "../controllers/auth.controller.js";
import { assignMembership } from "../controllers/membership.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/me", verifyToken, userinfo);
router.get("/alluser", verifyToken, alluser);
router.get("/alltrainer", verifyToken, alltrainer);
router.get("/allmember", verifyToken, allMember);
router.get("/trainer/:id", getTrainerById);

router.post("/create", verifyToken, register);

router.put("/update/:id", verifyToken, updateUser);
router.put("/trainer_confirm/:id", verifyToken, trainerConfirm);
router.put("/trainer_reject/:id", verifyToken, trainerReject);
router.put("/membership/:id", verifyToken, assignMembership);

router.delete("/delete/:id", verifyToken, deleteUser);

export default router;
