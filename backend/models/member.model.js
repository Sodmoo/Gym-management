import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [],
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

const SubGoalSchema = new mongoose.Schema({
  title: { type: String, required: true }, // "Өдөрт 2л ус уух"
  target: { type: Number, default: 1 }, // зорилтот хэмжээ (л, удаа, цаг г.м.)
  progress: { type: Number, default: 0 }, // одоогийн ахиц
  unit: { type: String, default: "" }, // "л", "цаг", "удаа" гэх мэт
  createdAt: { type: Date, default: Date.now },
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
  subGoals: [SubGoalSchema],
  membership: {
    type: membershipSchema,
    default: {},
  },
});

export default mongoose.model("Member", memberSchema);
