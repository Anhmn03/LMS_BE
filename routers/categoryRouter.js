const express = require("express");
const { createCategory, getAllCategories } = require("../controllers/category.controller");
const router = express.Router();


router.post("/create", createCategory);
router.get("/", getAllCategories);

module.exports = router;
