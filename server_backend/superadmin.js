const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// Endpoint untuk membuat superadmin baru
router.post(
  "/superadmin",
  [
    body("email").isEmail().withMessage("Format email tidak valid"),
    body("username").notEmpty().withMessage("Username tidak boleh kosong"),
    body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;

    // Cek apakah sudah ada superadmin
    const countSql = "SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'";
    const [countResult] = await db.query(countSql);
    const superAdminCount = countResult[0].count;

    if (superAdminCount >= 1) {
      return res.status(400).json({ message: "Hanya satu superadmin yang diizinkan" });
    }

    // Buat UUID untuk userId dengan format superadmingamex-....
    const userId = `superadmingamex-${uuidv4().replace(/-/g, "").substring(0, 15)}`;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql =
        "INSERT INTO users (user_id, email, password, username, role, created_at) VALUES (?, ?, ?, ?, 'superadmin', NOW())"; // Role diatur sebagai 'superadmin'
      await db.query(sql, [userId, email, hashedPassword, username]);
      res.status(201).json({ message: "Superadmin berhasil dibuat", userId });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Endpoint untuk melihat semua user
router.get("/users", async (req, res) => {
  try {
    const sql = "SELECT user_id, email, username, role, created_at FROM users WHERE role IN ('user', 'admin')";
    const [users] = await db.query(sql);
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint untuk melihat profil user berdasarkan user_id
router.get("/users/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sql = "SELECT user_id, email, username, role, created_at FROM users WHERE user_id = ?";
    const [users] = await db.query(sql, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(users[0]); // Mengembalikan profil user yang ditemukan
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint untuk mengupdate user
router.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { email, username, password, newRole } = req.body; // Menambahkan newRole

  try {
    const updates = [];
    const params = [];

    // Jika ada field yang ingin diupdate, tambahkan ke array updates dan params
    if (email) {
      updates.push("email = ?");
      params.push(email);
    }
    if (username) {
      updates.push("username = ?");
      params.push(username);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      params.push(hashedPassword);
    }
    if (newRole && ["user", "admin"].includes(newRole)) {
      updates.push("role = ?");
      params.push(newRole);
    } else if (newRole) {
      return res.status(400).json({ message: "Role tidak valid. Harus 'user' atau 'admin'." });
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang diupdate" });
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
    await db.query(sql, params);
    res.json({ message: "User berhasil diupdate" });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint untuk menghapus user
router.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sql = "DELETE FROM users WHERE user_id = ? AND role IN ('user', 'admin')";
    const result = await db.query(sql, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan atau tidak dapat dihapus" });
    }

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
