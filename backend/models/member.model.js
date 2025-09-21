import mongoose from "mongoose";

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
});

export default mongoose.model("Member", memberSchema);
