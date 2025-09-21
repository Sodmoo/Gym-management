import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    experience: {
      type: Number,
      default: 0,
    }, // туршлагын жил
    specialization: {
      type: String,
      default: "",
    }, // фитнесс чиглэл
    certifications: {
      type: [String],
      default: [],
    }, // массив хэлбэрээр
  },
  { timestamps: true }
);

export default mongoose.model("Trainer", trainerSchema);
