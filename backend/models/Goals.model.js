import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String }, // short note about goal
  goalType: {
    type: String,
    enum: ["weight", "bodyFat", "muscleMass", "strength"],
    required: true,
  },
  currentValue: { type: Number, default: 0 },
  targetValue: { type: Number, required: true },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Goals", goalSchema);
