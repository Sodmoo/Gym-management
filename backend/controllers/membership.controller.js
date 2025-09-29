import {
  daysFromType,
  addDays,
  nowUTC,
} from "./membership_helper/membership.helper.js";
import Member from "../models/member.model.js";

export const assignMembership = async (req, res) => {
  try {
    const { id } = req.params;
    let { type, duration } = req.body;

    duration = duration ? parseInt(duration, 10) : daysFromType(type);
    if (!duration || duration <= 0) duration = daysFromType(type);

    const now = nowUTC();

    let member = await Member.findOne({ userId: id });

    const current =
      member.membership && member.membership.endDate
        ? new Date(member.membership.endDate)
        : null;

    const baseDate = current && current > now ? current : now;
    const newEndDate = addDays(baseDate, duration);

    const startDate =
      member.membership &&
      member.membership.startDate &&
      new Date(member.membership.startDate) < now
        ? member.membership.startDate
        : now;

    member.membership = {
      type,
      startDate,
      endDate: newEndDate,
      isActive: true,
    };

    await member.save();

    const updated = await Member.findOne({ userId: id }).lean();
    return res.json({
      success: true,
      member: updated,
      message: "Membership assigned/extended successfully",
    });
  } catch (error) {
    console.error("Error in assignMembership:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
