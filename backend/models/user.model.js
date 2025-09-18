import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    surname: {
      type: String,
      profilecheck: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      length: 8,
    },
    role: {
      type: String,
      enum: ["user", "trainer", "admin"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
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
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
