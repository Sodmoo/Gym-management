import workoutTemplateSchema from "../models/Workout.model.js";
import dietTemplateSchema from "../models/Diet.model.js";
import PlanSchema from "../models/Plan.model.js";
import { select } from "framer-motion/client";

export const createPlan = async (req, res) => {
  try {
    const {
      trainerId,
      memberId,
      title,
      goal,
      startDate,
      endDate,
      workoutTemplate,
      dietTemplate,
    } = req.body;

    // 1. Plan үүсгэнэ
    const plan = await PlanSchema.create({
      trainerId,
      memberId,
      title,
      goal,
      startDate,
      endDate,
      workoutTemplate,
      dietTemplate,
    });

    // 2. Duration тооцоолоод PlanDay автоматаар үүсгэнэ
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    res.status(201).json({
      message: "Plan амжилттай үүсгэлээ",
      plan,
      days,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan үүсгэхэд алдаа гарлаа", error });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PlanSchema.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }
    res.status(200).json({ message: "Plan амжилттай устгагдлаа" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan устгахад алдаа гарлаа", error });
  }
};

export const editPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const plan = await PlanSchema.findByIdAndUpdate(id, updates, { new: true });
    if (!plan) {
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }
    res.status(200).json({ message: "Plan амжилттай шинэчлэгдлээ", plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan шинэчлэхэд алдаа гарлаа", error });
  }
};

export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PlanSchema.findById(id)
      .populate("trainerId", "name email")
      .populate("memberId", "name email")
      .populate("workoutTemplate")
      .populate("dietTemplate");
    if (!plan) {
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }
    res.status(200).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan авахад алдаа гарлаа", error });
  }
};

export const getPlansByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const plans = await PlanSchema.find({ memberId })
      .populate("memberId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "-password" },
      })
      .populate("workoutTemplate")
      .populate("dietTemplate");
    res.status(200).json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plans авахад алдаа гарлаа", error });
  }
};

export const getPlansByTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const plans = await PlanSchema.find({ trainerId })
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "-password" },
      })
      .populate("workoutTemplate")
      .populate("dietTemplate");
    res.status(200).json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plans авахад алдаа гарлаа", error });
  }
};
