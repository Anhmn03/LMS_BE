const express = require("express");
const {
  getTeachers,
  getStudents,
  updateMe,
} = require("../controllers/user.controllers");
const { restrictTo, protect } = require("../controllers/auth.controllers");
const router = express.Router();

router.use(protect);
router.get("/teachers", restrictTo("admin"), getTeachers);
router.get("/students", getStudents);
router.put("/update", updateMe);
module.exports = router;
