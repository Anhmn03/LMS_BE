const express = require("express");

const { restrictTo, protect } = require("../controllers/auth.controllers");
const { getMonthlyRevenueStats, getCourseRevenueStats, getMostEnrolledCourses, getUserStats } = require("../controllers/statictis.controller");
const router = express.Router();
router.use(protect, restrictTo("Admin"));
router.get("/courses", getCourseRevenueStats);
router.get("/enroll", getMostEnrolledCourses);
router.get("/users", getUserStats);
router.get("/revenue", getMonthlyRevenueStats);


module.exports = router;
