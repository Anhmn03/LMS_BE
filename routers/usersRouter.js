const express = require("express");
const {  getTeachers, getStudents } = require("../controllers/user.controllers");
const router = express.Router();
router.get("/teachers",getTeachers);
router.get("/students",getStudents);

module.exports = router;