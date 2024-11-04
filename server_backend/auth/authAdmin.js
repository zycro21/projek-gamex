const jwt = require("jsonwebtoken");
const db = require("../db");

require("dotenv").config();
const JWT_ADMIN = process.env.JWT_ADMIN;

// Middleware untuk memeriksa token admin
const verifyAdminRole = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" }); // Unauthorized
  }

  try {
    // Periksa blacklist
    const sql = "SELECT * FROM token_blacklist WHERE token = ?";
    const [blacklistResults] = await db.query(sql, [token]);

    if (blacklistResults.length > 0) {
      return res.status(401).json({ message: "Token ada di blacklist" }); // Token ada di blacklist
    }

    // Verifikasi token jika tidak ada di blacklist
    jwt.verify(token, JWT_ADMIN, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token tidak valid" }); // Forbidden
      }

      // Cek apakah user memiliki role 'admin'
      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Akses ditolak: tidak memiliki hak admin" }); // Forbidden
      }

      req.user = user; // Simpan informasi user ke request
      next();
    });
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    return res.status(500).json({ message: "Internal Server Error" }); // Server error
  }
};

module.exports = { verifyAdminRole };
