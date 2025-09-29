import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import Trainer from "../models/trainer.model.js";
import bcryptjs from "bcryptjs";

export const userinfo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "Not found" });

    let extra = null;
    if (user.role === "user") {
      extra = await Member.findOne({ userId: user._id }).lean();
    } else if (user.role === "trainer") {
      extra = await Trainer.findOne({ userId: user._id }).lean();
    }

    // Safely get profileImage from extra (Member or Trainer)
    let profileImage = null;
    if (extra && extra.profileImage) {
      profileImage = `${req.protocol}://${req.get("host")}/uploads/${
        extra.profileImage
      }`;
    }

    res.json({
      ...user,
      ...(extra || {}),
      profileImage, // Always returns the correct path or null
    });
  } catch (error) {
    console.error("Error in userinfo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const alluser = async (req, res) => {
  try {
    // Get all users
    const users = await User.find({ role: "user" }).lean();

    // For each user, get extra info from Member
    const usersWithExtra = await Promise.all(
      users.map(async (user) => {
        const extra = await Member.findOne({ userId: user._id }).lean();
        let profileImage = null;
        if (extra && extra.profileImage) {
          profileImage = `${req.protocol}://${req.get("host")}/uploads/${
            extra.profileImage
          }`;
        }
        // Rename extra._id to memberId to avoid overwriting user._id
        const { _id: memberId, ...extraRest } = extra || {};
        return {
          ...user, // user._id is the User's id
          memberId, // memberId is the Member's id
          ...extraRest,
          profileImage,
        };
      })
    );

    res.json(usersWithExtra);
  } catch (error) {
    console.error("Error in alluser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true })
      .lean()
      .exec();
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await User.findByIdAndDelete(req.params.id);

    if (user.role === "user") {
      await Member.findOneAndDelete({ userId: user._id });
    } else if (user.role === "trainer") {
      await Trainer.findOneAndDelete({ userId: user._id });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const alltrainer = async (req, res) => {
  try {
    // Always use .find() to get an array
    const users = await User.find({ role: "trainer" }).lean();

    // For each trainer, merge User and Trainer info
    const trainersWithExtra = await Promise.all(
      (Array.isArray(users) ? users : []).map(async (user) => {
        const extra = await Trainer.findOne({ userId: user._id }).lean();
        let profileImage = null;
        let trainerId = null;
        let extraRest = {};
        if (extra) {
          trainerId = extra._id; // Save trainer's _id as trainerId
          const { _id, ...rest } = extra;
          extraRest = rest;
          if (extra.profileImage) {
            profileImage = `${req.protocol}://${req.get("host")}/uploads/${
              extra.profileImage
            }`;
          }
        }
        return {
          ...user, // user._id is the User's id
          trainerId, // trainerId is the Trainer's id
          ...extraRest, // all other trainer fields, except _id
          profileImage,
        };
      })
    );

    res.json(trainersWithExtra);
  } catch (error) {
    console.error("Error in alltrainer:", error);
    res.status(500).json({ message: "Internal server error" });
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
