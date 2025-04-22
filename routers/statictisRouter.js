const express = require("express");
const { getCourseRevenueStats, getMostEnrolledCourses, getUserStats } = require("../controllers/statictis.controller");
const router = express.Router();
router.get("/courses",getCourseRevenueStats);
router.get("/enroll", getMostEnrolledCourses);
router.get("/users",getUserStats);


module.exports = router;