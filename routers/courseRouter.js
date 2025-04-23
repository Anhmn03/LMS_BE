const express = require("express");
const { 
    getAllCourses,
    getCourseDetails
} = require("../controllers/course.controllers");
// const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// Public routes - anyone can access
router.get("/", getAllCourses);
router.get("/:courseId", getCourseDetails);

module.exports = router; 