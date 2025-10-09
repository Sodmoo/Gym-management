import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  title: { type: String, required: true },
  goal: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  workoutTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkoutTemplate",
  },
  dietTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "DietTemplate" },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Plan", PlanSchema);
