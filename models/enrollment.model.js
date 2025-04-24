const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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
    enrollmentDate: {
      type: Date,
      default: Date.now,
      required: [true, "Enrollment date is required"],
    },
    completedLessons: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
          required: [true, "Lesson ID is required"],
        },
        completedAt: {
          type: Date,
          default: Date.now,
          required: [true, "Completed date is required"],
        },
      },
    ],
    progress: {
      type: Number,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
      default: 0,
    },
  },
  { timestamps: true }
);

enrollmentSchema.pre("save", async function (next) {
  const lessonIds = this.completedLessons.map((lesson) => lesson.lessonId.toString());
  const uniqueLessonIds = new Set(lessonIds);
  if (lessonIds.length !== uniqueLessonIds.size) {
    return next(new Error("Cannot mark the same lesson as completed multiple times"));
  }

  try {
    const totalLessons = await mongoose.model("Lesson").countDocuments({ courseId: this.courseId });
    const completedCount = this.completedLessons.length;
    this.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    next();
  } catch (error) {
    next(error);
  }
});

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ "completedLessons.lessonId": 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);