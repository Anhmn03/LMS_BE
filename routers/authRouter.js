const express = require("express");
const authController = require("../controllers/auth.controllers");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.use(authController.protect);
router.patch("/updatePassword", authController.updatePassword);
module.exports = router;
