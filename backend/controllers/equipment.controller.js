import Equipment from "../models/equipment.model.js";

// GET all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching equipment", error: err.message });
  }
};

// GET single equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment)
      return res.status(404).json({ message: "Equipment not found" });
    res.json(equipment);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching equipment", error: err.message });
  }
};

// ADD new equipment
export const addEquipment = async (req, res) => {
  try {
    const newEquip = new Equipment(req.body);
    await newEquip.save();
    res.status(201).json(newEquip);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding equipment", error: err.message });
  }
};

// UPDATE equipment
export const updateEquipment = async (req, res) => {
  try {
    const updated = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Equipment not found" });
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating equipment", error: err.message });
  }
};

// DELETE equipment
export const deleteEquipment = async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Equipment not found" });
    res.json({ message: "Equipment deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting equipment", error: err.message });
  }
};
