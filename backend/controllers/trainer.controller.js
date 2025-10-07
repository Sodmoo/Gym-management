// controllers/trainer.controller.js
import Trainer from "../models/trainer.model.js";
import Member from "../models/member.model.js";
import workoutTemplateSchema from "../models/Workout.model.js";
import dietTemplateSchema from "../models/Diet.model.js";
import mongoose from "mongoose";

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
    const { trainerId, memberId } = req.body; // These are userId values (from Users collection)

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(trainerId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        message: "Invalid trainerId or memberId: Must be valid ObjectId",
      });
    }

    // Find trainer by userId
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // FIXED: Find member by userId (not by _id)
    const student = await Member.findById(memberId);
    if (!student) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Use member's _id for assignment (store Member ref in trainer.students)
    const studentId = student._id; // This is the Member document's _id
    if (!trainer.students.includes(studentId)) {
      trainer.students.push(studentId);
      await trainer.save();
    }

    // Optional: Repopulate students for full response
    await trainer.populate("students", "userId age phone goal"); // Select relevant fields

    res.json({
      message: "Student assigned successfully",
      trainer: {
        ...trainer.toObject(), // Convert to plain object
        students: trainer.students, // Already populated
      },
    });
  } catch (err) {
    console.error("Assign student error:", err); // Log for debugging
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
    const { id } = req.params; // id is trainerId (Trainer's _id)
    // Find the Trainer document
    const trainer = await Trainer.findById(id).lean();
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    // Find the User document for this trainer
    const user = await User.findById(trainer.userId).lean();

    // Merge User and Trainer info
    let profileImage = null;
    if (trainer.profileImage) {
      profileImage = `${req.protocol}://${req.get("host")}/uploads/${
        trainer.profileImage
      }`;
    }

    // Populate students with Member info
    const students = await Promise.all(
      (trainer.students || []).map(async (studentId) => {
        const member = await Member.findById(studentId).lean();
        if (!member) return null;
        const user = await User.findById(member.userId).lean();
        return {
          ...user,
          memberId: member._id,
          ...member,
        };
      })
    );

    res.json({
      ...user,
      trainerId: trainer._id,
      ...trainer,
      profileImage,
      students: students.filter(Boolean), // Remove nulls
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

export const templateWorkout = async (req, res) => {
  try {
    const { trainerId, title, goal, description, durationWeeks, exercises } =
      req.body;

    // Шалгалт
    if (!trainerId || !title || !exercises || exercises.length === 0) {
      return res
        .status(400)
        .json({ message: "Бүх шаардлагатай талбарыг бөглөнө үү." });
    }

    const newTemplate = new workoutTemplateSchema({
      trainerId,
      title,
      goal,
      description,
      durationWeeks,
      exercises,
    });

    await newTemplate.save();
    res
      .status(201)
      .json({ message: "Template амжилттай үүслээ", data: newTemplate });
  } catch (error) {
    res.status(500).json({ message: "Template үүсгэхэд алдаа гарлаа", error });
  }
};

export const workoutTemplates = async (req, res) => {
  const trainerId = req.params.id;
  try {
    const templates = await workoutTemplateSchema.find({ trainerId });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
};

export const updateWorkoutTemplate = async (req, res) => {
  const templateId = req.params.id;
  const updates = req.body;

  try {
    const updatedTemplate = await workoutTemplateSchema.findByIdAndUpdate(
      templateId,
      updates,
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({
      message: "Template амжилттай шинэчлэгдлээ",
      data: updatedTemplate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Template шинэчлэхэд алдаа гарлаа", error });
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
      durationWeeks,
      calories,
      dailyMeals,
      notes,
    } = req.body;

    const newTemplate = new dietTemplateSchema({
      trainerId,
      title,
      goal,
      durationWeeks,
      calories,
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
