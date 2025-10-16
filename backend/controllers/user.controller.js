import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import Trainer from "../models/trainer.model.js";
import bcryptjs from "bcryptjs";

// 🧹 Helper: remove sensitive fields from any User object
const sanitizeUser = (user) => {
  if (!user) return user;
  const u = { ...user };
  delete u.password;
  delete u.resetToken;
  delete u.resetTokenExpiry;
  return u;
};

// ----------------------------
// GET current user info
// ----------------------------
export const userinfo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    let extra = null;
    if (user.role === "user") {
      extra = await Member.findOne({ userId: user._id }).lean();
    } else if (user.role === "trainer") {
      extra = await Trainer.findOne({ userId: user._id }).lean();
    }

    let profileImage = null;
    if (extra && extra.profileImage) {
      profileImage = `${req.protocol}://${req.get("host")}/uploads/${
        extra.profileImage
      }`;
    }

    res.json({
      ...sanitizeUser(user),
      ...(extra || {}),
      profileImage,
    });
  } catch (error) {
    console.error("Error in userinfo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------------
// GET all users (role: user)
// ----------------------------
export const alluser = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").lean();

    const usersWithExtra = await Promise.all(
      users.map(async (user) => {
        const extra = await Member.findOne({ userId: user._id }).lean();
        let profileImage = null;
        if (extra && extra.profileImage) {
          profileImage = `${req.protocol}://${req.get("host")}/uploads/${
            extra.profileImage
          }`;
        }

        const { _id: memberId, ...extraRest } = extra || {};
        return {
          ...sanitizeUser(user),
          memberId,
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

// ----------------------------
// UPDATE user info
// ----------------------------
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent password updates here unless handled separately
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .select("-password")
      .lean()
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------------
// DELETE user
// ----------------------------
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await User.findByIdAndDelete(req.params.id);

    if (user?.role === "user") {
      await Member.findOneAndDelete({ userId: user._id });
    } else if (user?.role === "trainer") {
      await Trainer.findOneAndDelete({ userId: user._id });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------------
// GET all trainers
// ----------------------------
export const alltrainer = async (req, res) => {
  try {
    const users = await User.find({ role: "trainer" })
      .select("-password")
      .lean();

    const trainersWithExtra = await Promise.all(
      users.map(async (user) => {
        const extra = await Trainer.findOne({ userId: user._id }).lean();
        let profileImage = null;
        let trainerId = null;
        let extraRest = {};

        if (extra) {
          trainerId = extra._id;
          const { _id, ...rest } = extra;
          extraRest = rest;

          if (extra.profileImage) {
            profileImage = `${req.protocol}://${req.get("host")}/uploads/${
              extra.profileImage
            }`;
          }
        }

        return {
          ...sanitizeUser(user),
          trainerId,
          ...extraRest,
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

// ----------------------------
// GET all members (populated)
// ----------------------------
export const allMember = async (req, res) => {
  try {
    const members = await Member.find()
      .populate(
        "userId",
        "surname username email role gender profileCompleted createdAt updatedAt"
      )
      .lean();

    const filteredMembers = members.filter(
      (m) => m.userId && m.userId.role === "user"
    );

    const membersWithExtra = filteredMembers.map((member) => {
      const user = member.userId;
      let profileImage = null;

      if (member.profileImage) {
        profileImage = `${req.protocol}://${req.get("host")}/uploads/${
          member.profileImage
        }`;
      }

      const { userId, ...memberRest } = member;

      return {
        ...sanitizeUser(user),
        userId: user._id,
        memberId: member._id,
        ...memberRest,
        profileImage,
      };
    });

    res.json(membersWithExtra);
  } catch (error) {
    console.error("Error in allMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
