import Member from "../models/member.model.js";
import Trainer from "../models/trainer.model.js";

export const memberinfo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const member = await Member.findOne({ userId: req.user.id }).lean();
    if (!member) return res.status(404).json({ message: "Not found" });
    res.json(member);
  } catch (error) {
    console.error("Error in memberinfo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/member.controller.js
export const addSubGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, target, unit } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const newSubGoal = {
      title,
      target: target || 1,
      unit: unit || "",
      progress: 0,
      createdAt: new Date(),
    };

    member.subGoals.push(newSubGoal);
    await member.save();

    // Шинээр хадгалагдсан subdoc-ийг авна (энд _id байгаа)
    const savedSubGoal = member.subGoals[member.subGoals.length - 1];

    return res.status(201).json({
      message: "Sub-goal added",
      subGoal: savedSubGoal,
      subGoals: member.subGoals,
    });
  } catch (error) {
    console.error("Error in addSubGoal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { memberId, subGoalId } = req.params;
    // support both { added } (increment) and { progress } (absolute)
    const { added, progress } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const subgoal = member.subGoals.id(subGoalId);
    if (!subgoal) return res.status(404).json({ message: "SubGoal not found" });

    if (typeof added === "number") {
      subgoal.progress += added;
    } else if (typeof progress === "number") {
      subgoal.progress = progress;
    } else {
      return res.status(400).json({
        message: "Send either { added: number } or { progress: number }",
      });
    }

    // optional: clamp progress between 0 and target
    const target = subgoal.target || Infinity;
    subgoal.progress = Math.max(0, Math.min(subgoal.progress, target));

    await member.save();

    // Return the updated subGoals array so frontend can set state easily
    return res.json({ message: "SubGoal updated", subGoals: member.subGoals });
  } catch (err) {
    console.error("Error in updateProgress:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const deleteSubGoal = async (req, res) => {
  try {
    const { memberId, subGoalId } = req.params;
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // SubGoal устгах
    member.subGoals.pull({ _id: subGoalId });
    await member.save();

    res.json({ message: "SubGoal deleted", subGoals: member.subGoals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinTrainer = async (req, res) => {
  try {
    const { memberId, trainerId } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Already requested check
    const alreadyRequested = member.trainers.some(
      (t) => t._id.toString() === trainerId
    );
    if (alreadyRequested)
      return res.status(400).json({ message: "Already requested" });

    // Add request
    member.trainers.push({ _id: trainerId, confirmed: false }); // pending
    await member.save();

    res.status(200).json({ message: "Join request sent", trainerId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
