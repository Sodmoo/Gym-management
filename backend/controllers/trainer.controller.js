// controllers/trainer.controller.js
import Trainer from "../models/trainer.model.js";
import Member from "../models/member.model.js";
import mongoose from "mongoose";

export const assignStudentToTrainer = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body; // These are userId values (from Users collection)

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(trainerId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        message: "Invalid trainerId or memberId: Must be valid ObjectId",
      });
    }

    // Find trainer by userId
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // FIXED: Find member by userId (not by _id)
    const student = await Member.findById(memberId);
    if (!student) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Use member's _id for assignment (store Member ref in trainer.students)
    const studentId = student._id; // This is the Member document's _id
    if (!trainer.students.includes(studentId)) {
      trainer.students.push(studentId);
      await trainer.save();
    }

    // Optional: Repopulate students for full response
    await trainer.populate("students", "userId age phone goal"); // Select relevant fields

    res.json({
      message: "Student assigned successfully",
      trainer: {
        ...trainer.toObject(), // Convert to plain object
        students: trainer.students, // Already populated
      },
    });
  } catch (err) {
    console.error("Assign student error:", err); // Log for debugging
    res.status(500).json({ message: err.message });
  }
};

export const removeStudentFromTrainer = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body;

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // FIXED: Find member by userId (not by _id)
    const student = await Member.findById(memberId);
    if (!student) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Remove student from array
    trainer.students = trainer.students.filter(
      (id) => id.toString() !== student._id.toString()
    );

    await trainer.save();
    res.json({ message: "Student removed", trainer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
