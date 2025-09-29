import cron from "node-cron";
import Member from "../../models/member.model.js";

// Runs every day at midnight
cron.schedule("* * * * *", async () => {
  try {
    const result = await Member.updateMany(
      {
        "membership.endDate": { $lt: new Date() },
        "membership.isActive": true,
      },
      { $set: { "membership.isActive": false } }
    );
  } catch (error) {
    console.error("Error updating membership status:", error);
  }
});
