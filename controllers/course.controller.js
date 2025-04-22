// controllers/course.controller.js
const Course = require("../models/course.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

exports.createCourse = async (req, res) => {
  try {
    const { title, description, image, categoryId, price, shortIntroVideo } =
      req.body;
    const teacherId = req.user.id; // Assuming user ID is available from authentication

    // Validate teacher exists and has teacher role
    const teacher = await User.findById(teacherId).populate("role");
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    if (teacher.role.name !== "teacher") {
      return res
        .status(403)
        .json({ success: false, message: "Only teachers can create courses" });
    }

    // Validate category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Create new course
    const newCourse = await Course.create({
      title,
      description,
      image,
      teacherId,
      categoryId,
      price,
      shortIntroVideo,
      status: "PENDING", // Set initial status as PENDING for admin approval
      completionStatus: "INCOMPLETE",
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully and pending approval",
      data: newCourse,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id; // Assuming user ID is available from authentication

    // Get all courses for the teacher
    const courses = await Course.find({ teacherId })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user.id; // Assuming user ID is available from authentication

    // Validate course ID format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Get course and check if it belongs to the teacher
    const course = await Course.findById(courseId).populate(
      "categoryId",
      "name"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course belongs to the requesting teacher
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this course",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user.id; // Assuming user ID is available from authentication
    const { title, description, image, categoryId, price, shortIntroVideo } =
      req.body;

    // Validate course ID format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Check if course exists and belongs to the teacher
    let course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course belongs to the requesting teacher
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this course",
      });
    }

    // Validate category if provided
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Only allow updates if course is in DRAFT or REJECTED status
    if (!["DRAFT", "REJECTED"].includes(course.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update course that is pending approval or already approved",
      });
    }

    // Update the course
    course = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        image,
        categoryId,
        price,
        shortIntroVideo,
        status: "PENDING", // Set status back to PENDING after update
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Course updated and pending approval",
      data: course,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user.id; // Assuming user ID is available from authentication

    // Validate course ID format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course belongs to the requesting teacher
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course",
      });
    }

    // Only allow deletion if course is in DRAFT or REJECTED status
    if (!["DRAFT", "REJECTED"].includes(course.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete course that is pending approval or already approved",
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
