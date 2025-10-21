// controllers/trainer.controller.js
import User from "../models/user.model.js";
import Trainer from "../models/trainer.model.js";
import Member from "../models/member.model.js";
import workoutTemplateSchema from "../models/Workout.model.js";
import dietTemplateSchema from "../models/Diet.model.js";
import mongoose from "mongoose";
import measurementSchema from "../models/Measurement.model.js";
import goalSchema from "../models/Goals.model.js";
import PlanModel from "../models/Plan.model.js";
import scheduleSchema from "../models/Schedule.model.js";

export const trainers = async (req, res) => {
  try {
    // Зөвхөн батлагдсан trainer-уудыг авна
    const trainers = await Trainer.find({ isconfirmed: true })
      .populate("userId") // user info-г авна
      .lean();

    const trainersWithExtra = trainers.map((trainer) => {
      const profileImage = trainer.profileImage
        ? `${req.protocol}://${req.get("host")}/uploads/${trainer.profileImage}`
        : `${req.protocol}://${req.get("host")}/uploads/default-profile.png`;

      return {
        trainerId: trainer._id,
        ...trainer,
        user: trainer.userId, // User info-г user талбарт
        profileImage,
      };
    });

    res.json(trainersWithExtra);
  } catch (error) {
    console.error("Error in trainers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignStudentToTrainer = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(trainerId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        message: "Invalid trainerId or memberId: Must be valid ObjectId",
      });
    }

    // Find trainer by ID
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Find member by ID
    const student = await Member.findById(memberId);
    if (!student) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Add if not already assigned
    const studentId = student._id;
    if (!trainer.students.includes(studentId)) {
      trainer.students.push(studentId);
      await trainer.save();
    }

    // ✅ Nested populate: Member → User
    await trainer.populate({
      path: "students", // First populate members
      populate: {
        path: "userId", // Then populate each member's user
        select: "name email role profileImage", // Choose which user fields to include
      },
      select: "userId joinedDate progress", // Choose which member fields to include
    });

    res.json({
      message: "Student assigned successfully",
      trainer,
    });
  } catch (err) {
    console.error("Assign student error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const removeStudentFromTrainer = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body;

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // FIXED: Find member by userId (not by _id)
    const student = await Member.findById(memberId);
    if (!student) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Remove student from array
    trainer.students = trainer.students.filter(
      (id) => id.toString() !== student._id.toString()
    );

    await trainer.save();
    res.json({ message: "Student removed", trainer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const trainerConfirm = async (req, res) => {
  try {
    const { id } = req.params; // id is the User's _id
    const trainer = await Trainer.findOneAndUpdate(
      { userId: id },
      { isconfirmed: true },
      { new: true }
    )
      .lean()
      .exec();
    res.json({
      success: true,
      trainer,
      message: "Тренерийг амжилттай баталгаажууллаа",
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const trainerReject = async (req, res) => {
  try {
    const { id } = req.params; // id is the User's _id
    const trainer = await Trainer.findOneAndUpdate(
      { userId: id },
      { isconfirmed: false },
      { new: true }
    )
      .lean()
      .exec();
    res.json({ success: true, trainer, message: "Тренерийг хаслаа" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params; // Trainer ID (from Trainer collection)
    const trainer = await Trainer.findById(id).lean();

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // 🧠 Fetch trainer's user info
    const user = await User.findById(trainer.userId)
      .select("-password") // remove password
      .lean();

    // 🧩 Trainer profile image
    const profileImage = trainer.profileImage
      ? `${req.protocol}://${req.get("host")}/uploads/${trainer.profileImage}`
      : `${req.protocol}://${req.get("host")}/uploads/default-profile.png`;

    // 🧠 Populate students fully
    const students = await Promise.all(
      (trainer.students || []).map(async (memberId) => {
        const member = await Member.findById(memberId).lean();
        if (!member) return null;

        const memberUser = await User.findById(member.userId)
          .select("-password")
          .lean();

        if (!memberUser) return null;

        return {
          memberId: member._id,
          ...member,
          userId: memberUser._id,
          ...memberUser,
          profileImage: member.profileImage
            ? `${req.protocol}://${req.get("host")}/uploads/${
                member.profileImage
              }`
            : `${req.protocol}://${req.get(
                "host"
              )}/uploads/default-profile.png`,
        };
      })
    );

    // ✅ Final response structure
    res.json({
      trainerId: trainer._id,
      userId: trainer.userId,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      gender: user?.gender,
      age: trainer.age,
      phone: trainer.phone,
      address: trainer.address,
      experience: trainer.experience,
      specialization: trainer.specialization,
      certifications: trainer.certifications,
      isconfirmed: trainer.isconfirmed,
      profileImage,
      students: students.filter(Boolean),
    });
  } catch (error) {
    console.error("Error in getTrainerById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignedStudents = async (req, res) => {
  try {
    const trainerId = req.params.id;
    const trainer = await Trainer.findById(trainerId)
      .populate("students")
      .lean();

    res.json(trainer.students || []);
  } catch (error) {
    console.error("Error in assignedStudents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Workout template functions
export const templateWorkout = async (req, res) => {
  try {
    const {
      trainerId,
      title,
      goal,
      description,
      category,
      difficulty,
      durationWeeks,
      program,
    } = req.body; // UPDATED: Add category, difficulty

    // 1️⃣ Validation
    if (
      !trainerId ||
      !title ||
      !Array.isArray(program) ||
      program.length === 0
    ) {
      return res.status(400).json({
        message:
          "Бүх шаардлагатай талбарыг бөглөнө үү (trainerId, title, program).",
      });
    }

    // 2️⃣ Program structure шалгах
    for (const day of program) {
      if (!day.dayName) {
        return res.status(400).json({
          message: "Өдрийн нэр (dayName) заавал шаардлагатай.",
        });
      }

      // UPDATED: Infer rest day from empty exercises (no need for isRestDay)
      const isRestDay = !day.exercises || day.exercises.length === 0;
      if (!isRestDay) {
        if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
          return res.status(400).json({
            message: `${day.dayName} -д дасгалуудыг оруулна уу.`,
          });
        }

        for (const ex of day.exercises) {
          if (!ex.name || !ex.sets || !ex.reps) {
            return res.status(400).json({
              message: `${day.dayName} дахь дасгал бүрийн name, sets, reps шаардлагатай.`,
            });
          }
        }
      }
    }

    // 3️⃣ Template үүсгэх
    const newTemplate = new workoutTemplateSchema({
      trainerId,
      title,
      goal,
      description,
      category, // NEW: Save if provided
      difficulty, // NEW: Save if provided
      durationWeeks,
      program,
    });

    await newTemplate.save();

    // 4️⃣ Trainer-д холбоос хадгалах (optional)
    await Trainer.findByIdAndUpdate(trainerId, {
      $addToSet: { workoutPlans: newTemplate._id },
    });

    // 5️⃣ Response буцаах
    res.status(201).json({
      message: "Workout Template амжилттай үүслээ.",
      data: newTemplate,
    });
  } catch (error) {
    console.error("Workout template error:", error);
    res.status(500).json({
      message: "Workout Template үүсгэхэд алдаа гарлаа.",
      error: error.message,
    });
  }
};

// ✅ Тухайн trainer-ийн бүх Template авах
export const workoutTemplates = async (req, res) => {
  const trainerId = req.params.id;

  try {
    const templates = await workoutTemplateSchema.find({ trainerId }).sort({
      createdAt: -1,
    });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({
      message: "Template жагсаалт татахад алдаа гарлаа.",
      error: error.message,
    });
  }
};

// ✅ Template шинэчлэх
export const updateWorkoutTemplate = async (req, res) => {
  const templateId = req.params.id;
  const updates = req.body;

  try {
    const existingTemplate = await workoutTemplateSchema.findById(templateId); // FIXED: Use workoutTemplateSchema
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template олдсонгүй." });
    }

    // 🧠 Хэрвээ program update хийгдсэн бол Rest Day logic дахин шалгах
    if (updates.program) {
      for (const day of updates.program) {
        if (!day.dayName) {
          return res.status(400).json({
            message: "Program дотор dayName талбар байх шаардлагатай.",
          });
        }

        if (!day.isRestDay) {
          if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
            return res.status(400).json({
              message: `${day.dayName} -д дасгалуудыг оруулна уу.`,
            });
          }

          for (const ex of day.exercises) {
            if (!ex.name || !ex.sets || !ex.reps) {
              return res.status(400).json({
                message: `${day.dayName} дахь дасгал бүрийн name, sets, reps шаардлагатай.`,
              });
            }
          }
        }
      }
    }

    const updatedTemplate = await workoutTemplateSchema.findByIdAndUpdate(
      // FIXED: Use workoutTemplateSchema
      templateId,
      updates,
      { new: true }
    );

    res.status(200).json({
      message: "Workout Template амжилттай шинэчлэгдлээ.",
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Template шинэчлэхэд алдаа гарлаа.",
      error: error.message,
    });
  }
};

export const deleteWorkoutTemplate = async (req, res) => {
  const templateId = req.params.id;
  try {
    const deleted = await workoutTemplateSchema.findByIdAndDelete(templateId);
    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
};

// Diet template functions
export const templateDiet = async (req, res) => {
  try {
    const {
      trainerId,
      title,
      goal,
      description,
      category,
      difficulty,
      durationDays,
      totalCalories,
      dailyMeals,
      notes,
    } = req.body; // UPDATED: Match frontend fields

    const newTemplate = new dietTemplateSchema({
      trainerId,
      title,
      goal,
      description, // NEW
      category, // NEW
      difficulty, // NEW
      durationDays, // FIXED: Use durationDays
      totalCalories, // FIXED: Use totalCalories
      dailyMeals,
      notes,
    });
    await newTemplate.save();
    res
      .status(201)
      .json({ message: "Diet Template амжилттай үүслээ", data: newTemplate });
  } catch (error) {
    res.status(500).json({ message: "Template үүсгэхэд алдаа гарлаа", error });
  }
};

export const dietTemplates = async (req, res) => {
  const trainerId = req.params.id;
  try {
    const templates = await dietTemplateSchema.find({ trainerId });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
};

export const updateDietTemplate = async (req, res) => {
  const templateId = req.params.id;
  const updates = req.body;
  try {
    const updatedTemplate = await dietTemplateSchema.findByIdAndUpdate(
      templateId,
      updates,
      { new: true }
    );
    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({
      message: "Diet Template амжилттай шинэчлэгдлээ",
      data: updatedTemplate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Template шинэчлэхэд алдаа гарлаа", error });
  }
};

export const deleteDietemplate = async (req, res) => {
  const templateId = req.params.id;
  try {
    const deleted = await dietTemplateSchema.findByIdAndDelete(templateId);
    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({ message: "Diet Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
};

// Measurement and Goal functions
export const addmeasurement = async (req, res) => {
  try {
    const data = req.body;

    // Automatically find and assign plan for the member
    if (!data.member) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    const plan = await PlanModel.findOne({ memberId: data.member });
    if (!plan) {
      return res
        .status(404)
        .json({ message: "No assigned plan found for this member" });
    }

    // Add plan to data
    data.plan = plan._id;

    // 1️⃣ Шинэ measurement үүсгэх
    const newMeasurement = new measurementSchema(data);

    await newMeasurement.save();

    // 2️⃣ Member-ийн goals-г олох
    const goals = await goalSchema.find({ member: data.member });

    // 3️⃣ Goals-ийн currentValue-г шинэчлэх
    for (let goal of goals) {
      switch (goal.goalType) {
        case "weight":
          goal.currentValue = data.weight;
          break;
        case "bodyFat":
          goal.currentValue = data.bodyFat;
          break;
        case "muscleMass":
          goal.currentValue = data.muscleMass;
          break;
        case "waist":
          goal.currentValue = data.waist;
          break;
        // шаардлагатай бол бусад goalType нэмнэ
        default:
          break;
      }
      await goal.save();
    }

    res.status(201).json({
      message: "Measurement амжилттай үүслээ, goals шинэчлэгдсэн",
      data: newMeasurement,
    });
  } catch (error) {
    res.status(500).json({ message: "Measurement алдаа гарлаа", error });
  }
};

export const editmeasurement = async (req, res) => {
  try {
    const updated = await measurementSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Measurement not found" });

    res.status(200).json({
      success: true,
      message: "Measurement updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMeasurement = async (req, res) => {
  try {
    const deleted = await measurementSchema.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Measurement not found" });
    }
    res.status(200).json({ message: "Measurement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting measurement", error });
  }
};

export const getMeasurementsByMember = async (memberId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error("Invalid memberId: Must be a valid ObjectId");
    }
    const measurements = await measurementSchema
      .find({ member: memberId })
      .sort({ date: -1 });
    return measurements;
  } catch (error) {
    console.error("Error fetching measurements:", error);
    throw error;
  }
};

export const getMeasurements = async (req, res) => {
  try {
    const id = req.params.id;

    const filter = id ? { member: id } : {};
    const measurements = await measurementSchema
      .find(filter)
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: measurements.length,
      data: measurements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeasurementsByPlan = async (planId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      throw new Error("Invalid planId: Must be a valid ObjectId");
    }
    const measurements = await measurementSchema
      .find({ plan: planId })
      .sort({ date: -1 });
    return measurements;
  } catch (error) {
    console.error("Error fetching measurements by plan:", error);
    throw error;
  }
};

export const addGoal = async (req, res) => {
  try {
    const data = req.body;
    const newGoal = new goalSchema(data);
    await newGoal.save();
    res.status(201).json({ message: "Goal амжилттай үүслээ", data: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Goal үүсгэхэд алдаа гарлаа", error });
  }
};

export const editGoal = async (req, res) => {
  try {
    const updated = await goalSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const deleted = await goalSchema.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error });
  }
};

export const getGoalsByMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid memberId" });
    }
    const goals = await goalSchema.find({ member: memberId });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Schedule controller
export const createSchedule = async (req, res) => {
  try {
    const schedule = new scheduleSchema({
      trainerId: req.body.trainerId,
      memberId: req.body.memberId,
      planId: req.body.planId,
      date: req.body.date,
      type: req.body.type, // "measurement" эсвэл "meeting"
      workoutTemplateId: req.body.workoutTemplateId || undefined,
      startTime: req.body.startTime || "09:00",
      endTime: req.body.endTime || "10:00",
      note: req.body.note || "",
    });

    const saved = await schedule.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create custom schedule",
      error: error.message,
    });
  }
};

// 🟡 GET ALL Schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await scheduleSchema
      .find()
      .populate("planId")
      .populate("trainerId")
      .populate("memberId")
      .populate("workoutTemplateId")
      .sort({ date: 1 }); // sort by date ascending

    res.status(200).json(schedules);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get schedules", error: error.message });
  }
};

export const getSchedulesByTrainer = async (req, res) => {
  try {
    const trainerId = req.params.id;
    // Then populate
    const schedules = await scheduleSchema
      .find({ trainerId })
      .populate({
        path: "memberId",
        populate: {
          path: "userId",
          select: "surname username email",
        },
      })
      .populate("planId", "title goal")
      .populate("workoutTemplateId", "title")
      .sort({ date: 1 });

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get trainer schedules",
      error: error.message,
    });
  }
};

export const getTodaySchedules = async (req, res) => {
  try {
    const trainerId = req.params.trainerId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const schedules = await scheduleSchema
      .find({
        trainerId,
        date: { $gte: today, $lt: tomorrow },
      })
      .populate("memberId", "name email")
      .populate("planId", "title")
      .populate("workoutTemplateId", "title")
      .sort({ startTime: 1 });

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get today's schedules",
      error: error.message,
    });
  }
};

export const markScheduleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { isCompleted: true },
      { new: true }
    );
    res.status(200).json(schedule);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update schedule", error: error.message });
  }
};
// 🔵 UPDATE Schedule
export const updateSchedule = async (req, res) => {
  try {
    const updated = await scheduleSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updated)
      return res.status(404).json({ message: "Schedule not found" });
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update schedule", error: error.message });
  }
};

// 🔴 DELETE Schedule
export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await scheduleSchema.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Schedule not found" });
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete schedule", error: error.message });
  }
};
