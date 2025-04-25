const express = require("express");
const {
  updateCourseStatus,
  getDraftCourses,
  getApprovedCourses,
  getRejectedCourses,
  updateCompletionStatus,
  getAllCourses,
  updateLessonStatus,
  getStudentsInCourses,
  getEnrollmentsByStudentId,
} = require("../controllers/courseManager.controller");
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();
router.use(protect);
// Get All Courses (New Route)
router.get("/", getAllCourses);
// Get Students Enrolled in or Completed at Least One Course (New Route)
router.get("/students", restrictTo("Admin"), getStudentsInCourses);

// Update Course Status Route
router.put("/:id/status", restrictTo("Admin"), updateCourseStatus);

// List Courses by Status Routes
router.get("/status/draft", restrictTo("Admin"), getDraftCourses);
router.get("/status/approved", restrictTo("Admin"), getApprovedCourses);
// Update Completion Status Route (New)
router.put(
  "/:id/completion-status",
  restrictTo("Admin", "Teacher"),
  updateCompletionStatus
);
router.get("/status/rejected", restrictTo("Admin"), getRejectedCourses);

router.get(
  "/:studentId/students",
  restrictTo("Admin"),
  getEnrollmentsByStudentId
);

/////LESSON
//Update lesson status
router.put(
  "/:courseId/lessons/:lessonId/status",
  restrictTo("student"),
  updateLessonStatus
);

module.exports = router;
