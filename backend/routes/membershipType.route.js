import express from "express";
import {
  createMembershipType,
  getAllMembershipTypes,
  updateMembershipType,
  deleteMembershipType,
} from "../controllers/membershipType.controller.js";

const router = express.Router();

// Membership төрлүүд
router.post("/", createMembershipType); // шинээр нэмэх
router.get("/", getAllMembershipTypes); // бүгдийг авах
router.put("/:id", updateMembershipType); // Edit хийх
router.delete("/:id", deleteMembershipType); // Modal хэрэггүй шууд устгах

export default router;
