// controllers/trainer.controller.js
import Trainer from "../models/trainer.model.js";
import Member from "../models/member.model.js";

export const assignStudentToTrainer = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body; // these are userId values

    // Find trainer by userId
    const trainer = await Trainer.findOne({ userId: trainerId });
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    // Find member by userId
    const student = await Member.findOne({ userId: memberId });
    if (!student) return res.status(404).json({ message: "Member not found" });

    // Use member's _id for assignment
    if (!trainer.students.includes(student._id)) {
      trainer.students.push(student._id);
      await trainer.save();
    }

    res.json({ message: "Student assigned", trainer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const removeStudentFromTrainer = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body;

    // Find trainer by userId
    const trainer = await Trainer.findOne({ userId: trainerId });
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    // Find member by userId
    const student = await Member.findOne({ userId: memberId });
    if (!student) return res.status(404).json({ message: "Member not found" });

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
