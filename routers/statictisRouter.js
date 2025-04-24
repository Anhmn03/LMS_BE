const express = require("express");
const {
  getCourseRevenueStats,
  getMostEnrolledCourses,
  getUserStats,
} = require("../controllers/statictis.controller");
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();
router.use(protect, restrictTo("admin"));
router.get("/courses", getCourseRevenueStats);
router.get("/enroll", getMostEnrolledCourses);
router.get("/users", getUserStats);

module.exports = router;
