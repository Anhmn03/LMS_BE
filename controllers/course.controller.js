// controllers/course.controller.js
const Course = require("../models/course.model");
const Category = require("../models/category.model");
const mongoose = require("mongoose");

exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      categoryId,
      price,
      shortIntroVideo,
      teacherId,
    } = req.body;

    // Không cần kiểm tra user role, chỉ kiểm tra category
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
console.log("Finding category with ID:", categoryId);
const loglog = await Category.findById(categoryId);
console.log("Category found:", loglog);
    // Create new course
    const newCourse = await Course.create({
      title,
      description,
      image,
      teacherId, // Lấy teacherId từ body request thay vì từ user đăng nhập
      categoryId,
      price,
      shortIntroVideo,
      status: "PENDING", // Vẫn giữ quy trình phê duyệt
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

exports.getAllCourses = async (req, res) => {
  try {
    // Lấy tất cả khóa học thay vì lọc theo teacherId
    const courses = await Course.find()
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

    // Validate course ID format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Get course without checking ownership
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
    const {
      title,
      description,
      image,
      categoryId,
      price,
      shortIntroVideo,
      teacherId,
    } = req.body;

    // Validate course ID format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Check if course exists
    let course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
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
        teacherId: teacherId || course.teacherId, // Cho phép cập nhật teacherId
        categoryId: categoryId || course.categoryId,
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
