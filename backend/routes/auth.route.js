import express from "express";
import {
  checkAuth,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verify } from "crypto";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check", verifyToken, checkAuth);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:id/:token", resetPassword);

export default router;
