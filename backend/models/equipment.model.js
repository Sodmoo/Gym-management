import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["cardio", "strength", "flexibility", "balance"],
    default: null,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  purchaseDate: {
    type: Date,
    default: null,
  },
  condition: {
    type: String,
    enum: ["new", "good", "fair", "poor"],
    default: "good",
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["available", "in use", "maintenance", "out of order"],
    default: "available",
  },
});
export default mongoose.model("Equipment", equipmentSchema);
