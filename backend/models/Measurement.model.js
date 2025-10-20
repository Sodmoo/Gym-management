import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  date: { type: Date, default: Date.now },

  // Body metrics
  weight: Number, // lbs
  bodyFat: Number, // %
  muscleMass: Number, // lbs
  waist: Number, // inches
  chest: Number, // inches
  arms: Number, // inches
  thighs: Number, // inches

  notes: String,
});

export default mongoose.model("Measurement", measurementSchema);
