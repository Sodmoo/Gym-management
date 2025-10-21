import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  type: {
    type: String,
    enum: ["weight", "bodyFat", "muscleMass", "strength"],
    required: true,
  },
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: String,
});

export default mongoose.model("Progress", progressSchema);
