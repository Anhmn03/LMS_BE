const express = require("express");
const {
  getAllCourses,
  getCourseDetails,
} = require("../controllers/course.controllers");
// const { isAuthenticated } = require("../middlewares/auth");
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();

// Public routes - anyone can access
router.get("/", protect, restrictTo("admin", "student"), getAllCourses);
router.get(
  "/:courseId",
  protect,
  restrictTo("admin", "student"),
  getCourseDetails
);

module.exports = router;
