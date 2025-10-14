import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  rest: { type: Number, default: 60 },
});

const programDaySchema = new mongoose.Schema({
  dayName: { type: String, required: true }, // Monday, Tuesday, etc.
  isRestDay: { type: Boolean, default: false }, // 💤 true = амралтын өдөр
  notes: { type: String }, // option: “Active recovery”, “Stretching”
  exercises: [exerciseSchema],
});

const workoutTemplateSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    title: { type: String, required: true },
    goal: { type: String },
    description: { type: String },
    durationWeeks: { type: Number, default: 4 },
    program: [programDaySchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("WorkoutTemplate", workoutTemplateSchema);
