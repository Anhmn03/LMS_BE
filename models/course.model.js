const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minLength: [3, "Title must be at least 3 characters"],
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minLength: [10, "Description must be at least 10 characters"],
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      trim: true,
      match: [/^$|\.(jpg|jpeg|png|gif)$/, "Thumbnail must be a valid image URL"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    completionStatus: {
      type: String,
      enum: ["COMPLETED", "INCOMPLETE", "BANNED"],
      default: "INCOMPLETE",
    },
    shortIntroVideo: {
      type: String,
      trim: true,
      match: [/^$|\.(mp4|webm|ogg)$/, "Short intro video must be a valid video URL (mp4, webm, ogg)"],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);