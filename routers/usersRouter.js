const express = require("express");
const {
  getTeachers,
  getStudents,
  updateMe,
   getUserById, createTeacher, toggleUserStatus, searchTeachers, searchStudents,
} = require("../controllers/user.controllers");
const { restrictTo, protect } = require("../controllers/auth.controllers");
const router = express.Router();

router.use(protect);
router.get("/teachers", restrictTo("admin"), getTeachers);
router.get("/students", getStudents);
router.put("/update", updateMe);
router.get("/detail/:id",getUserById);
router.post("/createTeacher",createTeacher);
router.put("/updateStatus/:id",toggleUserStatus);
router.get("/teachers/search",searchTeachers);
router.get("/students/search",searchStudents);
module.exports = router;
