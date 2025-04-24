const express = require("express");
const {
  getTeachers,
  getStudents,
  updateMe,
} = require("../controllers/user.controllers");
const { restrictTo, protect } = require("../controllers/auth.controllers");
const router = express.Router();
router.use(protect);
router.put("/update", updateMe);
router.use(restrictTo("admin"));
router.get("/teachers", getTeachers);
router.get("/students", getStudents);
module.exports = router;
