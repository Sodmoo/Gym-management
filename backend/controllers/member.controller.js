import Member from "../models/member.model.js";

export const addSubGoal = async (req, res) => {
  try {
    const { id } = req.params; // Member's userId
    const { title, target, unit } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const newSubGoal = {
      title,
      target: target || 1,
      unit: unit || "",
      progress: 0,
      createdAt: new Date(),
    };
    member.subGoals.push(newSubGoal);
    await member.save();
    res.status(201).json({ message: "Sub-goal added", subGoal: newSubGoal });
  } catch (error) {
    console.error("Error in addSubGoal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// SubGoal дээр ахиц нэмэх
export const updateProgress = async (req, res) => {
  try {
    const { memberId, subGoalId } = req.params;
    const { added } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const subgoal = member.subGoals.id(subGoalId); // subdocument олох
    if (!subgoal) {
      return res.status(404).json({ message: "SubGoal not found" });
    }

    subgoal.progress += added;
    await member.save();

    res.json({
      ...subgoal.toObject(),
      percent: (subgoal.progress / subgoal.target) * 100,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubGoal = async (req, res) => {
  try {
    const { memberId, subGoalId } = req.params;
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const subgoal = member.subGoals.id(subGoalId);
    if (!subgoal) {
      return res.status(404).json({ message: "SubGoal not found" });
    }
    subgoal.remove();
    await member.save();
    res.json({ message: "SubGoal deleted", subGoals: member.subGoals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
