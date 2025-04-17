const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    addedAt: {
      type: Date,
      default: Date.now,
      required: [true, "Added date is required"],
    },
  },
  { timestamps: true }
);

cartSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);