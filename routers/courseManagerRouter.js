const express = require("express");
const { updateCourseStatus, 
    getDraftCourses, 
    getApprovedCourses, 
    getRejectedCourses,
    updateCompletionStatus,
    getAllCourses,
    updateLessonStatus,
    getStudentsInCourses,getEnrollmentsByStudentId } = require("../controllers/course.controller");

const router = express.Router();

// Get All Courses (New Route)
router.get("/", getAllCourses);
// Get Students Enrolled in or Completed at Least One Course (New Route)
router.get("/students", getStudentsInCourses);

// Update Course Status Route
router.put("/:id/status", updateCourseStatus);

// List Courses by Status Routes
router.get("/status/draft", getDraftCourses);
router.get("/status/approved", getApprovedCourses);
// Update Completion Status Route (New)
router.put("/:id/completion-status", updateCompletionStatus);
router.get("/status/rejected", getRejectedCourses);


router.get("/:studentId/students", getEnrollmentsByStudentId);

/////LESSON
//Update lesson status
router.put("/:courseId/lessons/:lessonId/status", updateLessonStatus);


module.exports = router;