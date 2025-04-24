const express = require("express");
const { 
    addToCart,
    getCart,
    removeFromCart
} = require("../controllers/cart.controllers");
// const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// All cart routes need authentication
router.post("/add", /*isAuthenticated,*/ addToCart);
router.get("/", /*isAuthenticated,*/ getCart);
router.delete("/:courseId", /*isAuthenticated,*/ removeFromCart);

module.exports = router; 