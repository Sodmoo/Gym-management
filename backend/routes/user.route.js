import express from "express";
import { userinfo } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/me", verifyToken, userinfo);

export default router;
