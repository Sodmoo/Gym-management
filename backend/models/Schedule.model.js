import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: false,
    },

    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    // тухайн өдрийн огноо
    date: {
      type: Date,
      required: true,
    },

    // тухайн өдрийн төрлийг заана: workout, rest, эсвэл measurement
    type: {
      type: String,
      enum: ["workout", "measurement", "meeting"],
      default: "workout",
    },

    // хэрвээ workout бол ямар template ашиглахыг заана
    workoutTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutTemplate",
      require: false,
    },

    // тухайн өдрийн дасгал хийх цаг
    startTime: {
      type: String, // жишээ нь "09:00"
      default: null,
    },

    endTime: {
      type: String, // жишээ нь "10:00"
      default: null,
    },

    // тухайн өдөр хийгдсэн эсэх
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // дасгал дууссаны дараах тэмдэглэл, сэтгэгдэл гэх мэт
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Schedule", scheduleSchema);
