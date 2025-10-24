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
    start.setHours(0, 0, 0, 0); // Set to start of day in local timezone
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0); // Set to start of day in local timezone

    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.ceil((end - start) / msPerDay) + 1;

    const workoutDurationMinutes = 60;
    const bufferMinutes = 30; // 30-minute break after each workout
    const bufferMs = bufferMinutes * 60 * 1000;

    const possibleStarts = [];
    for (let h = 9; h <= 20; h++) {
      possibleStarts.push({ hour: h, min: 0 });
      if (h < 20) {
        possibleStarts.push({ hour: h, min: 30 });
      }
    }

    const schedulesToInsert = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start.getTime() + i * msPerDay);
      currentDate.setHours(0, 0, 0, 0); // Ensure start of day

      const dayOfWeek = currentDate.getDay();

      const dayProgram = template.program.find(
        (d) => weekDayMap[d.dayName] === dayOfWeek
      );

      if (!dayProgram) continue;
      if (dayProgram.isRestDay) continue;

      // Fetch existing workout schedules for this trainer on this date (any member)
      const existingSchedules = await Schedule.find({
        trainerId,
        date: currentDate,
        type: "workout",
      });

      // Find the first available non-overlapping slot with buffer
      let startTimeStr = null;
      let endTimeStr = null;
      let slotFound = false;

      for (let slot of possibleStarts) {
        const { hour, min } = slot;
        const candidateStart = new Date(currentDate.getTime());
        candidateStart.setHours(hour, min, 0, 0); // Set local hour and minute
        const candidateEnd = new Date(
          candidateStart.getTime() + workoutDurationMinutes * 60 * 1000
        );

        let overlaps = false;
        for (let ex of existingSchedules) {
          if (ex.startTime && ex.endTime) {
            let exStart, exEnd;
            if (typeof ex.startTime === "string") {
              // Parse string "HH:MM" to Date on currentDate
              const [h, m] = ex.startTime.split(":").map(Number);
              exStart = new Date(currentDate.getTime());
              exStart.setHours(h, m || 0, 0, 0);

              const [eh, em] = ex.endTime.split(":").map(Number);
              exEnd = new Date(currentDate.getTime());
              exEnd.setHours(eh, em || 0, 0, 0);
            } else {
              // Assume Date object
              exStart = new Date(ex.startTime);
              exEnd = new Date(ex.endTime);
            }

            if (isNaN(exStart.getTime()) || isNaN(exEnd.getTime())) {
              continue; // Skip invalid dates
            }

            const extendedEnd = new Date(exEnd.getTime() + bufferMs);
            // Overlap if candidate starts before extended end of existing AND ends after start of existing
            if (candidateStart < extendedEnd && candidateEnd > exStart) {
              overlaps = true;
              break;
            }
          }
        }

        if (!overlaps) {
          // Calculate end time
          const endMinutes = min + workoutDurationMinutes;
          const endHour = hour + Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;
          startTimeStr = `${hour.toString().padStart(2, "0")}:${min
            .toString()
            .padStart(2, "0")}`;
          endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMin
            .toString()
            .padStart(2, "0")}`;
          slotFound = true;
          break;
        }
      }

      // If no slot found all day, create with null times (or skip: if (!slotFound) continue;)
      schedulesToInsert.push({
        planId: plan._id,
        trainerId,
        memberId,
        date: currentDate,
        type: "workout",
        workoutTemplateId: template._id,
        startTime: startTimeStr, // string "HH:MM" or null
        endTime: endTimeStr, // string "HH:MM" or null
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

    // Fetch the existing plan
    const plan = await PlanSchema.findById(id).session(session);
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }

    // Detect changes
    const templateChanged =
      updates.workoutTemplate &&
      updates.workoutTemplate.toString() !== plan.workoutTemplate?.toString();

    const dateChanged =
      updates.startDate !== plan.startDate.toISOString().split("T")[0] ||
      updates.endDate !== plan.endDate.toISOString().split("T")[0];

    // Update plan fields
    Object.assign(plan, updates);
    await plan.save({ session });

    // Handle schedule updates
    if (templateChanged || dateChanged) {
      const template = await workoutTemplateSchema
        .findById(plan.workoutTemplate)
        .session(session);

      if (!template || !template.program?.length) {
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
          message:
            "Plan шинэчлэгдсэн боловч Workout Template хоосон эсвэл олдсонгүй.",
          plan,
        });
      }

      if (dateChanged) {
        // --- FULL REGENERATION (Dates changed) ---
        await Schedule.deleteMany({ planId: plan._id }).session(session);

        const start = new Date(plan.startDate);
        const end = new Date(plan.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const msPerDay = 24 * 60 * 60 * 1000;
        const totalDays = Math.ceil((end - start) / msPerDay) + 1;

        const schedulesToInsert = [];

        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(start.getTime() + i * msPerDay);
          currentDate.setHours(0, 0, 0, 0);
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
            startTime: "09:00", // default start time
            endTime: "10:00", // default end time
            isCompleted: false,
            note: dayProgram.notes || "",
          });
        }

        if (schedulesToInsert.length > 0)
          await Schedule.insertMany(schedulesToInsert, { session });
      } else if (templateChanged) {
        // --- UPDATE TEMPLATE ONLY (Keep schedule times) ---
        const existingSchedules = await Schedule.find({
          planId: plan._id,
          type: "workout",
        }).session(session);

        for (let sch of existingSchedules) {
          const dayOfWeek = sch.date.getDay();
          const dayProgram = template.program.find(
            (d) => weekDayMap[d.dayName] === dayOfWeek
          );

          if (!dayProgram || dayProgram.isRestDay) continue;

          sch.workoutTemplateId = template._id;
          sch.note = dayProgram.notes || sch.note;
          await sch.save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Plan болон Schedule-ууд амжилттай шинэчлэгдлээ.",
      plan,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("editPlan error:", error);
    res.status(500).json({
      message: "Plan шинэчлэхэд алдаа гарлаа.",
      error: error.message,
    });
  }
};

// ---------------- DELETE PLAN ----------------
export const deletePlan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const plan = await PlanSchema.findById(id).session(session);
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Тухайн Plan олдсонгүй" });
    }

    await PlanSchema.deleteOne({ _id: id }).session(session);
    await Schedule.deleteMany({ planId: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Plan болон холбоотой Schedule-ууд устгагдлаа" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("deletePlan error:", error);
    res.status(500).json({ message: "Plan устгахад алдаа гарлаа", error });
  }
};

// ---------------- GET SINGLE PLAN ----------------
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
    console.error("getPlan error:", error);
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
    console.error("getPlansByMember error:", error);
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
    console.error("getPlansByTrainer error:", error);
    res.status(500).json({ message: "Plans авахад алдаа гарлаа", error });
  }
};
