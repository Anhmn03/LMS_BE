const express = require("express");
const {
  createCheckoutSession,
  stripeWebhook,
} = require("../controllers/payment.controllers");
// const { isAuthenticated } = require("../middlewares/auth");
const { protect, restrictTo } = require("../controllers/auth.controllers");
const router = express.Router();

// // Checkout session require authentication
// router.post("/create-checkout-session", /*isAuthenticated,*/ createCheckoutSession);

// // Webhook doesn't need authentication as it's called by Stripe
// router.post("/webhook", stripeWebhook);
const bodyParser = require("body-parser");

// Route cho Stripe Webhook – phải để raw body!
router.post("/webhook", stripeWebhook);

// Route cho tạo session checkout – có thể dùng JSON
router.post(
  "/create-checkout-session",
  protect,
  restrictTo("student"),
  /*isAuthenticated,*/ createCheckoutSession
);
module.exports = router;
