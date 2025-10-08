import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String, // жишээ нь "Chest", "Legs", "Back"
  },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  rest: { type: Number, default: 60 }, // секундээр
});

const workoutTemplateSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    goal: {
      type: String, // жишээ: "Weight Loss", "Strength Building"
    },
    description: {
      type: String,
    },
    durationWeeks: {
      type: Number,
      default: 4, // template нийт хэдэн долоо хоногийн хөтөлбөр вэ
    },
    program: [
      {
        dayName: String, // "Monday"
        exercises: [exerciseSchema],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkoutTemplate", workoutTemplateSchema);
