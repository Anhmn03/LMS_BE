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
router.get("/students", restrictTo("admin"), getStudentsInCourses);

// Update Course Status Route
router.put("/:id/status", restrictTo("admin"), updateCourseStatus);

// List Courses by Status Routes
router.get("/status/draft", restrictTo("admin"), getDraftCourses);
router.get("/status/approved", restrictTo("admin"), getApprovedCourses);
// Update Completion Status Route (New)
router.put(
  "/:id/completion-status",
  restrictTo("admin", "teacher"),
  updateCompletionStatus
);
router.get("/status/rejected", restrictTo("admin"), getRejectedCourses);

router.get(
  "/:studentId/students",
  restrictTo("admin"),
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
