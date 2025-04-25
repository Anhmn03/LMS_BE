const express = require("express");
const { getPayments } = require("../controllers/payment.controllers");
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();

const bodyParser = require("body-parser");
router.use(protect, restrictTo("Admin"));

router.get("/", getPayments);

module.exports = router;
