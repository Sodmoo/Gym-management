import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import Trainer from "../models/trainer.model.js";

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
