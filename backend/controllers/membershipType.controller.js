// controllers/membershipType.controller.js
import MembershipType from "../models/membershipType.model.js";

// Бүх төрлүүд авах
export const getAllMembershipTypes = async (req, res) => {
  try {
    const types = await MembershipType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: "Алдаа гарлаа: " + err.message });
  }
};

// Membership төрөл нэмэх
export const createMembershipType = async (req, res) => {
  try {
    const type = new MembershipType(req.body);
    await type.save();
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ error: "Нэмэх үед алдаа: " + err.message });
  }
};

// Membership төрөл засах
export const updateMembershipType = async (req, res) => {
  try {
    const type = await MembershipType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!type) return res.status(404).json({ error: "Төрөл олдсонгүй" });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: "Засах үед алдаа: " + err.message });
  }
};

// Membership төрөл устгах
export const deleteMembershipType = async (req, res) => {
  try {
    const type = await MembershipType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ error: "Төрөл олдсонгүй" });
    res.json({ message: "Membership төрөл устгагдлаа" });
  } catch (err) {
    res.status(400).json({ error: "Устгах үед алдаа: " + err.message });
  }
};
