import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    default: null,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: {
    type: Number,
    default: null,
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "",
  },
  height: {
    type: Number,
    default: null,
  },
  weight: {
    type: Number,
    default: null,
  },
  goal: {
    type: String,
    default: "",
  },
  membership: {
    type: membershipSchema,
    default: {},
  },
});

export default mongoose.model("Member", memberSchema);
