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

export const createUser = async (req, res) => {
  const { surname, username, email, password, role, gender } = req.body;
  try {
    if (!surname || !username || !email || !password || !role) {
      return res.status(400).json({ message: "Талбар дутуу байна" });
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
    const user = new User({
      surname,
      username,
      email,
      password: hashedPassword,
      role,
      gender,
    });
    await user.save();
    const newMember = new Member({ userId: user._id });
    await newMember.save();

    res.status(201).json({ message: "Хэрэглэгч амжилттай үүсгэлээ" });
  } catch (error) {
    console.error("алдаа гарлаа", error);
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
    const users = await User.find({ role: "trainer" }).lean();
    const trainersWithExtra = await Promise.all(
      users.map(async (user) => {
        const extra = await Trainer.findOne({ userId: user._id }).lean();
        return {
          ...user,
          ...(extra || {}),
        };
      })
    );
    res.json(trainersWithExtra);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const trainerConfirm = async (req, res) => {
  try {
    const { id } = req.params; // id is the User's _id
    const trainer = await Trainer.findByIdAndUpdate(
      id,
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
    const trainer = await Trainer.findByIdAndUpdate(
      id,
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
