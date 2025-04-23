// routes/course.routes.js
const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const authMiddleware = require("../middleware/auth.middleware");
const teacherMiddleware = require("../middleware/teacher.middleware");

// Apply authentication and teacher role check to all routes
// router.use(authMiddleware.protect);
// router.use(teacherMiddleware.isTeacher);

// Course routes
router.post("/", courseController.createCourse);
router.get("/all-courses", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
