import express from "express";
import {
  getAllEquipment,
  getEquipmentById,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "../controllers/equipment.controller.js";

const router = express.Router();

router.get("/", getAllEquipment); // Бүх хэрэгсэл авах
router.get("/:id", getEquipmentById); // Нэг хэрэгсэл авах
router.post("/", addEquipment); // Шинэ хэрэгсэл нэмэх
router.put("/:id", updateEquipment); // Хэрэгсэл засах
router.delete("/:id", deleteEquipment); // Хэрэгсэл устгах

export default router;
