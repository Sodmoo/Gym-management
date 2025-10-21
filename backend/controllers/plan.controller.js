import mongoose from "mongoose";
import workoutTemplateSchema from "../models/Workout.model.js";
import dietTemplateSchema from "../models/Diet.model.js";
import PlanSchema from "../models/Plan.model.js";
import Schedule from "../models/Schedule.model.js";

const MONGOLIA_UTC_OFFSET = 8;

const weekDayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// ---------------- CREATE PLAN ----------------
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

    const template = await workoutTemplateSchema.findById(workoutTemplate);
    if (!template || !template.program?.length) {
      return res.status(201).json({
        message:
          "Plan үүссэн боловч Workout Template олдсонгүй эсвэл program хоосон.",
        plan,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(MONGOLIA_UTC_OFFSET, 0, 0, 0);
    end.setUTCHours(MONGOLIA_UTC_OFFSET, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.ceil((end - start) / msPerDay) + 1;

    const schedulesToInsert = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start.getTime() + i * msPerDay);
      const dayOfWeek = currentDate.getDay();

      const dayProgram = template.program.find(
        (d) => weekDayMap[d.dayName] === dayOfWeek
      );

      if (!dayProgram) continue;
      if (dayProgram.isRestDay) continue;

      schedulesToInsert.push({
        planId: plan._id,
        trainerId,
        memberId,
        date: currentDate,
        type: "workout",
        workoutTemplateId: template._id,
        startTime: null,
        endTime: null,
        isCompleted: false,
        note: dayProgram.notes || "",
      });
    }

    const createdSchedules =
      schedulesToInsert.length > 0
        ? await Schedule.insertMany(schedulesToInsert)
        : [];

    res.status(201).json({
      message: "Plan болон Schedule-ууд амжилттай үүслээ.",
      plan,
      createdCount: createdSchedules.length,
      schedules: createdSchedules,
    });
  } catch (error) {
    console.error("createPlan error:", error);
    res.status(500).json({
      message: "Plan үүсгэхэд алдаа гарлаа.",
      error: error.message,
    });
  }
};

// ---------------- EDIT PLAN ----------------
export const editPlan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await PlanSchema.findById(id).session(session);
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }

    const templateChanged =
      updates.workoutTemplate &&
      updates.workoutTemplate.toString() !== plan.workoutTemplate?.toString();

    Object.assign(plan, updates);
    await plan.save({ session });

    if (templateChanged) {
      const now = new Date();
      await Schedule.deleteMany({
        planId: plan._id,
        date: { $gte: now },
      }).session(session);

      const template = await workoutTemplateSchema.findById(
        updates.workoutTemplate
      );
      if (!template) throw new Error("Workout Template олдсонгүй");

      const start = new Date(plan.startDate);
      const end = new Date(plan.endDate);
      start.setUTCHours(MONGOLIA_UTC_OFFSET, 0, 0, 0);
      end.setUTCHours(MONGOLIA_UTC_OFFSET, 0, 0, 0);

      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDays = Math.ceil((end - start) / msPerDay) + 1;

      const schedulesToInsert = [];
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(start.getTime() + i * msPerDay);
        const dayOfWeek = currentDate.getDay();

        const dayProgram = template.program.find(
          (d) => weekDayMap[d.dayName] === dayOfWeek
        );
        if (!dayProgram || dayProgram.isRestDay) continue;

        schedulesToInsert.push({
          planId: plan._id,
          trainerId: plan.trainerId,
          memberId: plan.memberId,
          date: currentDate,
          type: "workout",
          workoutTemplateId: template._id,
          startTime: null,
          endTime: null,
          isCompleted: false,
          note: dayProgram.notes || "",
        });
      }

      if (schedulesToInsert.length > 0) {
        await Schedule.insertMany(schedulesToInsert, { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Plan амжилттай шинэчлэгдлээ", plan });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("editPlan error:", error);
    res
      .status(500)
      .json({ message: "Plan шинэчлэхэд алдаа гарлаа", error: error.message });
  }
};

// ---------------- DELETE PLAN ----------------
export const deletePlan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const plan = await PlanSchema.findByIdAndDelete(id).session(session);
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }

    await Schedule.deleteMany({ planId: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Plan болон холбоотой Schedule-ууд устгагдлаа" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Plan устгахад алдаа гарлаа", error });
  }
};

// ---------------- GET PLAN ----------------
export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PlanSchema.findById(id)
      .populate("trainerId", "name email")
      .populate("memberId", "name email")
      .populate("workoutTemplate")
      .populate("dietTemplate");
    if (!plan)
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    res.status(200).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan авахад алдаа гарлаа", error });
  }
};

// ---------------- GET PLANS BY MEMBER ----------------
export const getPlansByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const plans = await PlanSchema.find({ memberId })
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

// ---------------- GET PLANS BY TRAINER ----------------
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
