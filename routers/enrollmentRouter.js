const express = require("express");
const { 
    enrollAfterPayment,
    getEnrolledCourses
} = require("../controllers/enrollment.controllers");
// const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// All enrollment routes need authentication
router.post("/enroll", /*isAuthenticated,*/ enrollAfterPayment);
router.get("/my-courses", /*isAuthenticated,*/ getEnrolledCourses);

module.exports = router; 