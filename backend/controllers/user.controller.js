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
        return {
          ...user,
          ...(extra || {}),
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

export const alltrainer = async (req, res) => {
  try {
    const trainers = await User.find({ role: "trainer" }).lean();
    res.json(trainers);
  } catch (error) {
    console.error("Error in alltrainer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { surname, username, email, password, role, gender } = req.body;
    if (!surname || !username || !email || !password || !role || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      return res.status(400).json({ message: "Бүртгэлтэй хэрэглэгч" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Нууц үг багадаа 6 оронтой байна" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      surname,
      username,
      email,
      password: hashedPassword,
      role,
      gender,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser._id });
  } catch (error) {
    console.error("Error in createUser:", error);
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
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id).lean().exec();
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
