import express from "express";
import { allMember } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/allmember", allMember);

export default router;
