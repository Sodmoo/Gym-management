import mongoose from "mongoose";

const membershipTypeSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  days: { type: Number, required: true },
});

export default mongoose.model("MembershipType", membershipTypeSchema);
