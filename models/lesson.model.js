const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minLength: [3, "Lesson title must be at least 3 characters"],
      maxLength: [100, "Lesson title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    contentType: {
      type: String,
      enum: ["video", "document"],
      required: [true, "Content type is required"],
    },
    contentUrl: {
      type: String,
      trim: true,
      required: [true, "Content URL is required"],
      match: [
        /^$|\.(mp4|webm|ogg|pdf|doc|docx|ppt|pptx)$/,
        "Content URL must be a valid video or document format",
      ],
    },
    status: {
      type: String,
      enum: ["COMPLETE", "INCOMPLETE"],
      default: "INCOMPLETE",
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Lesson", lessonSchema);
