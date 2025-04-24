const express = require("express");
const { 
 
    getPayments
} = require("../controllers/payment.controllers");

const router = express.Router();

const bodyParser = require("body-parser");


router.get("/",getPayments)

module.exports = router; 