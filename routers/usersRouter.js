const express = require("express");
const {  getTeachers, getStudents, getUserById, createTeacher, toggleUserStatus, searchTeachers, searchStudents } = require("../controllers/user.controllers");
const router = express.Router();
router.get("/teachers",getTeachers);
router.get("/students",getStudents);
router.get("/detail/:id",getUserById);
router.post("/createTeacher",createTeacher);
router.put("/updateStatus/:id",toggleUserStatus);
router.get("/teachers/search",searchTeachers);
router.get("/students/search",searchStudents);


module.exports = router;