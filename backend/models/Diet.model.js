import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ж: "Breakfast"
  description: String, // ж: "Oatmeal + banana + protein shake"
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

const dietTemplateSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    title: { type: String, required: true },
    goal: { type: String },
    durationDays: { type: Number, default: 7 },
    totalCalories: Number,
    dailyMeals: [mealSchema],
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("DietTemplate", dietTemplateSchema);
