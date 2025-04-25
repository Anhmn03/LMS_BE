const express = require("express");
const {
  getCourseRevenueStats,
  getMostEnrolledCourses,
  getUserStats,
  getMonthlyRevenueStats,
} = require("../controllers/statictis.controller");
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();
router.use(protect, restrictTo("Admin"));
router.get("/courses", getCourseRevenueStats);
router.get("/enroll", getMostEnrolledCourses);
router.get("/users", getUserStats);
router.get("/revenue", getMonthlyRevenueStats);

module.exports = router;
