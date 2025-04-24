const express = require("express");
const {
  GetLessonsByCourse,
  getAllLessonsByCourse,
  updateLessonProgress,
  getCourseProgress,
} = require("../controllers/lesson.controllers");
// const { isAuthenticated } = require("../middlewares/auth"); // Assuming you have an auth middleware
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();
router.use(protect, restrictTo("student"));

// Public route - basic info
router.get("/course/:courseId", GetLessonsByCourse);
// Protected routes - require authentication
router.get(
  "/course/:courseId/details",
  /*isAuthenticated,*/ getAllLessonsByCourse
);
router.post(
  "/course/:courseId/lesson/:lessonId/complete",
  /*isAuthenticated,*/ updateLessonProgress
);
router.get(
  "/course/:courseId/progress",
  /*isAuthenticated,*/ getCourseProgress
);

module.exports = router;
