// middleware.js
const jwt = require("jsonwebtoken");
const db = require("../db");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ADMIN = process.env.JWT_ADMIN;

// Middleware untuk memeriksa token
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  // Periksa blacklist
  const sql = "SELECT * FROM token_blacklist WHERE token = ?";
  const [blacklistResults] = await db.query(sql, [token]);

  if (blacklistResults.length > 0) {
    return res.sendStatus(401); // Token ada di blacklist
  }

  // Verifikasi token jika tidak ada di blacklist
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Jika verifikasi dengan JWT_SECRET gagal, coba verifikasi dengan JWT_ADMIN
      jwt.verify(token, JWT_ADMIN, (err, adminUser) => {
        if (err) {
          return res.sendStatus(403); // Forbidden
        }
        req.user = { ...adminUser, role: "admin" }; // Menyimpan informasi admin ke req.user
        next();
      });
    } else {
      req.user = { ...user, role: "user" }; // Menyimpan informasi user ke req.user
      next();
    }
  });
};

module.exports = { authenticateJWT };
