const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Lesson = require("../models/lesson.model");
const Enrollment = require("../models/enrollment.model");
const User = require("../models/user.model");

// Update Course Status Controller
exports.updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update the course
    const course = await Course.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course status updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Completion Status Controller
exports.updateCompletionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionStatus } = req.body;

    // Validate completionStatus (only allow BANNED or INCOMPLETE)
    const validCompletionStatuses = ["BANNED", "INCOMPLETE"];
    if (!validCompletionStatuses.includes(completionStatus)) {
      return res.status(400).json({
        message: "Completion status can only be updated to BANNED or INCOMPLETE",
      });
    }

    // Find the course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check current completionStatus and apply rules
    if (course.completionStatus === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot change completion status from COMPLETED to BANNED or INCOMPLETE",
      });
    }

    // Allow transition between INCOMPLETE and BANNED
    if (
      (course.completionStatus === "INCOMPLETE" && completionStatus === "BANNED") ||
      (course.completionStatus === "BANNED" && completionStatus === "INCOMPLETE")
    ) {
      course.completionStatus = completionStatus;
    } else {
      return res.status(400).json({
        message: "Completion status can only transition between INCOMPLETE and BANNED",
      });
    }

    // Update the completionStatus
    await course.save();

    res.status(200).json({ message: "Completion status updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Lesson Status Controller
exports.updateLessonStatus = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["COMPLETE", "INCOMPLETE"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid lesson status value" });
    }

    // Convert courseId and lessonId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    // Find the lesson and ensure it belongs to the specified course
    const lesson = await Lesson.findOne({ _id: lessonObjectId, courseId: courseObjectId });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found or does not belong to the specified course" });
    }

    // Check current status and apply one-way update rule
    if (lesson.status === "COMPLETE") {
      return res.status(400).json({
        message: "Cannot change lesson status from COMPLETE to INCOMPLETE",
      });
    }

    if (lesson.status === "INCOMPLETE" && status === "COMPLETE") {
      // Allow transition from INCOMPLETE to COMPLETE
      lesson.status = status;
    } else {
      return res.status(400).json({
        message: "Lesson status can only be updated from INCOMPLETE to COMPLETE",
      });
    }

    // Save the updated lesson
    await lesson.save();

    // Check if all lessons in the course are COMPLETE
    const allLessons = await Lesson.find({ courseId: courseObjectId });
    const allLessonsComplete = allLessons.every(lesson => lesson.status === "COMPLETE");

    // If all lessons are COMPLETE, update the course's completionStatus to COMPLETED
    if (allLessonsComplete) {
      await Course.findByIdAndUpdate(courseObjectId, { completionStatus: "COMPLETED" });
    }

    res.status(200).json({ message: "Lesson status updated successfully", lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Students Enrolled in or Completed at Least One Course (Updated)
exports.getStudentsInCourses = async (req, res) => {
  try {
    // Step 1: Find all enrollments and populate studentId and courseId with specific fields
    const enrollments = await Enrollment.find()
      .populate("studentId", "fullName email profilePicture") // Chỉ lấy fullName, email, profilePicture từ users
      .populate("courseId", "title description image") // Chỉ lấy title, description, image từ courses
      .lean();

    // Step 2: Check if there are any enrollments
    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({
        enrollments: [],
        total: 0
      });
    }

    // Step 3: Count total enrollments
    const totalEnrollments = enrollments.length;

    // Step 4: Return all enrollment data with populated fields
    res.status(200).json({
      enrollments,
      total: totalEnrollments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// List All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacherId", "fullName email")
      .populate("categoryId", "name")
      .lean();

    const totalCourses = await Course.countDocuments();

    res.status(200).json({
      courses,
      total: totalCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List Courses with Status DRAFT
exports.getDraftCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "DRAFT" })
      .populate("teacherId", "fullName email")
      .populate("categoryId", "name")
      .lean();

    const totalCourses = await Course.countDocuments({ status: "DRAFT" });

    res.status(200).json({
      courses,
      total: totalCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List Courses with Status APPROVED
exports.getApprovedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "APPROVED" })
      .populate("teacherId", "fullName email")
      .populate("categoryId", "name")
      .lean();

    const totalCourses = await Course.countDocuments({ status: "APPROVED" });

    res.status(200).json({
      courses,
      total: totalCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List Courses with Status REJECTED
exports.getRejectedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "REJECTED" })
      .populate("teacherId", "fullName email")
      .populate("categoryId", "name")
      .lean();

    const totalCourses = await Course.countDocuments({ status: "REJECTED" });

    res.status(200).json({
      courses,
      total: totalCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Students Enrolled in or Completed a Specific Course
exports.getEnrollmentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Kiểm tra xem studentId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    // Step 1: Find all enrollments for the given studentId and populate studentId and courseId
    const enrollments = await Enrollment.find({ studentId })
      .populate("studentId", "fullName email profilePicture") // Chỉ lấy fullName, email, profilePicture từ users
      .populate({
        path: "courseId", // Populate courseId
        select: "title description image teacherId", // Lấy các trường title, description, image, teacherId
        populate: {
          path: "teacherId", // Populate teacherId bên trong courseId
          select: "fullName" // Chỉ lấy fullName của teacher từ bảng users
        }
      })
      .lean();

    // Step 2: Check if there are any enrollments
    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({
        enrollments: [],
        total: 0
      });
    }

    // Step 3: Count total enrollments
    const totalEnrollments = enrollments.length;

    // Step 4: Return all enrollment data with populated fields
    res.status(200).json({
      enrollments,
      total: totalEnrollments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};