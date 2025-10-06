// WorkoutPlan.js
import mongoose from "mongoose";

const WorkoutPlan = new mongoose.Schema(
  {
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
    title: String,
    goal: String,
    duration: String, // e.g. "4 weeks"
    exercises: [
      {
        name: String,
        sets: Number,
        reps: Number,
        restTime: String,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("WorkoutPlan", WorkoutPlan);
