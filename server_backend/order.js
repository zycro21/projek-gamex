const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin");

// Create Order
router.post("/createOrder", verifyAdminRole, async (req, res) => {
    const { order_date, total_price, payment_status} = req.body; // Inisiasi Body dari Method Create Order
});
