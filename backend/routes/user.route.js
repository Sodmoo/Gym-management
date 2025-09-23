import express from "express";
import {
  alltrainer,
  alluser,
  createUser,
  deleteUser,
  updateUser,
  userinfo,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/me", verifyToken, userinfo);
router.get("/alluser", verifyToken, alluser);
router.get("/alltrainer", verifyToken, alltrainer);

router.post("/create", verifyToken, createUser);

router.put("/update/:id", verifyToken, updateUser);

router.delete("/delete/:id", verifyToken, deleteUser);

export default router;
