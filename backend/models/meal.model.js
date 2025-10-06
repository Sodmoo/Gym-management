// DietTemplate.js
import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: String,
  description: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  time: String,
});

const dietTemplateSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    title: String,
    goal: String,
    totalCalories: Number,
    meals: [mealSchema],
  },
  { timestamps: true }
);

export default mongoose.model("DietTemplate", dietTemplateSchema);
