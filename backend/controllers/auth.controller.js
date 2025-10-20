import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import Trainer from "../models/trainer.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.setCookie.js";
import nodemailer from "nodemailer";
import multer from "multer";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const upload = multer({ dest: "uploads/" });

export const register = async (req, res) => {
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

    if (role === "user") {
      const newMember = new Member({
        userId: user._id,
        membership: { isActive: false },
      });
      await newMember.save();
    } else if (role === "trainer") {
      const newTrainer = new Trainer({ userId: user._id });
      await newTrainer.save();
    }

    res.status(201).json({ message: "Хэрэглэгч амжилттай үүсгэлээ" });
  } catch (error) {
    console.error("алдаа гарлаа", error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Буруу нууц үг" });
    }

    // JWT cookie үүсгэх
    generateTokenAndSetCookie(res, user._id);

    let profileImage = null;

    // Role шалгах ба profileImage авах
    if (user.role === "trainer") {
      const trainer = await Trainer.findOne({ user: user._id });
      profileImage = trainer?.profileImage || null;
    }

    if (user.role === "user") {
      const member = await Member.findOne({ user: user._id });
      profileImage = member?.profileImage || null;
    }

    // Response буцаах
    return res.status(200).json({
      message: user.profileCompleted ? user.role : "шинэ " + user.role,
      user: {
        id: user._id,
        role: user.role,
        profileComplete: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  try {
    res.status(200).json({ success: true, message: "Амжилттай гарлаа" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Email олдсонгүй" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${user._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Node_mailer_user, // your email
        pass: process.env.Node_mailer_pass, // your email password
      },
    });

    var mailOptions = {
      from: "Smart Gym ",
      to: user.email,
      subject: "🔐 Нууц үг сэргээх линк",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #4CAF50;">Нууц үг сэргээх хүсэлт</h2>
        <p>Сайн байна уу?</p>
        <p>Та нууц үгээ мартсан тул доорх товчлуур дээр дарж дахин тохируулах боломжтой.</p>
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Нууц үг сэргээх
        </a>
        <p style="margin-top: 30px; font-size: 12px; color: #888;">
          Хэрвээ та ийм хүсэлт илгээж байгаагүй бол энэхүү имэйлийг үл тоогоорой.
        </p>
      </div>
    </div>
  `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: "Амжилттай" });
      }
    });

    res.json({ message: "Reset link ийг Email руу явуулсан" });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Нууц үг амжилттай шинэчлэгдлээ" });
  } catch (error) {
    console.error("Error in resetPassword controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    const {
      age,
      address,
      phone,
      height,
      weight,
      goal,
      experience,
      specialization,
      certifications,
    } = req.body;

    let profileImage = null;
    if (req.file) profileImage = `${req.file.filename}`;

    let profileRecord = null;

    if (user.role === "user") {
      profileRecord = await Member.findOneAndUpdate(
        { userId }, // schema-д таарсан талбар
        {
          userId,
          age: Number(age),
          address,
          phone,
          height: Number(height),
          weight: Number(weight),
          goal,
          ...(profileImage && { profileImage }),
        },
        { new: true, upsert: true }
      );
    } else if (user.role === "trainer") {
      profileRecord = await Trainer.findOneAndUpdate(
        { userId },
        {
          userId,
          age: Number(age),
          address,
          phone,
          height: Number(height),
          weight: Number(weight),
          experience,
          specialization,
          certifications: certifications ? certifications.split(",") : [],
          ...(profileImage && { profileImage }),
        },
        { new: true, upsert: true }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileCompleted: true },
      { new: true }
    ).select("-password");

    res.json({
      message: "Профайл амжилттай хадгалагдлаа",
      user: updatedUser,
      profile: profileRecord,
    });
  } catch (error) {
    console.error("completeProfile алдаа:", error);
    res.status(500).json({
      message: "Profile completion failed",
      error: error.message,
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
