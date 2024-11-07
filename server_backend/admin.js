const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("./db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { verifyAdminRole } = require("./auth/authAdmin"); // Mengimpor middleware untuk verifikasi admin

require("dotenv").config();
const JWT_ADMIN = process.env.JWT_ADMIN;

// Endpoint untuk membuat admin baru (tanpa middleware)
router.post(
  "/admins/register",
  [
    body("email").isEmail().withMessage("Format email tidak valid"),
    body("username").notEmpty().withMessage("Username tidak boleh kosong"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;
    const userId = `admingamex-${uuidv4().replace(/-/g, "").substring(0, 15)}`;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql =
        "INSERT INTO users (user_id, email, password, username, role, created_at) VALUES (?, ?, ?, ?, 'admin', NOW())";
      await db.query(sql, [userId, email, hashedPassword, username]);
      res.status(201).json({ message: "Admin berhasil dibuat", userId });
    } catch (error) {
      console.error("Error saat registrasi admin:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }
);

// Contoh untuk login admin
router.post(
  "/admins/login",
  [
    body("email").isEmail().withMessage("Format email tidak valid"),
    body("password").notEmpty().withMessage("Password tidak boleh kosong"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const sql =
        "SELECT user_id, email, username, password, role FROM users WHERE email = ? AND role = 'admin'";
      const [admins] = await db.query(sql, [email]);

      if (admins.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const admin = admins[0];
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Email atau Password Salah" });
      }

      const token = jwt.sign(
        {
          userId: admin.user_id,
          email: admin.email,
          username: admin.username,
          role: admin.role,
        },
        JWT_ADMIN,
        { expiresIn: "1h" }
      );

      res.status(200).json({ message: "Login Berhasil", token });
    } catch (error) {
      console.error("Error selama login admin:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }
);

// Endpoint untuk melihat semua akun dengan role 'user' dan sorting username
router.get("/users", verifyAdminRole, async (req, res) => {
  // Ambil parameter sort dari query, jika ada
  const { sort } = req.query;

  // Default sort SQL statement
  let sql =
    "SELECT user_id, email, username, created_at, role FROM users WHERE role IN ('user', 'admin')";

  // Tambahkan pengurutan sesuai parameter 'sort'
  if (sort === "asc") {
    sql += " ORDER BY username ASC";
  } else if (sort === "desc") {
    sql += " ORDER BY username DESC";
  }

  try {
    const [users] = await db.query(sql);
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint untuk melihat profil user berdasarkan username atau user_id
router.get("/users/profile", verifyAdminRole, async (req, res) => {
  // Middleware diterapkan di sini
  const { userId, username } = req.body;

  if (!userId && !username) {
    return res
      .status(400)
      .json({ message: "User ID atau username harus diberikan" });
  }

  try {
    let sql;
    let params;

    if (userId) {
      sql =
        "SELECT user_id, email, username, role, created_at FROM users WHERE user_id = ?";
      params = [userId];
    } else if (username) {
      sql =
        "SELECT user_id, email, username, role, created_at FROM users WHERE username = ?";
      params = [username];
    }

    const [users] = await db.query(sql, params);

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = users[0];

    if (user.role === "superadmin") {
      return res.status(403).json({
        message: "Akses ditolak: tidak bisa mengakses data superadmin",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update data user dengan role "user"
router.put(
  "/users/:userId",
  verifyAdminRole,
  [
    body("email").optional().isEmail().withMessage("Format email tidak valid"),
    body("username")
      .optional()
      .notEmpty()
      .withMessage("Username tidak boleh kosong"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { email, username, password } = req.body;

    try {
      // Fetch existing user data
      const [users] = await db.query(
        "SELECT role FROM users WHERE user_id = ?",
        [userId]
      );

      // Cek apakah pengguna ditemukan
      if (users.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Jika role pengguna yang diupdate bukan 'user', bisa mengizinkan update
      // Hanya admin yang bisa update pengguna yang bukan 'user'
      if (users[0].role !== "user" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      // Update user data
      let updateFields = [];
      let params = [];

      if (email) {
        updateFields.push("email = ?");
        params.push(email);
      }

      if (username) {
        updateFields.push("username = ?");
        params.push(username);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push("password = ?");
        params.push(hashedPassword);
      }

      params.push(userId);

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "Tidak ada data yang diubah" });
      }

      const sql = `UPDATE users SET ${updateFields.join(
        ", "
      )} WHERE user_id = ?`;
      await db.query(sql, params);

      res.json({ message: "Data user berhasil diperbarui" });
    } catch (error) {
      console.error("Error during update:", error); // Tambahkan log untuk debugging
      res.status(500).send(error);
    }
  }
);

// Endpoint untuk menghapus akun dengan role 'user'
router.delete("/users/:userId", verifyAdminRole, async (req, res) => {
  // Middleware diterapkan di sini
  const { userId } = req.params;

  try {
    const sql = "DELETE FROM users WHERE user_id = ? AND role = 'user'";
    const [result] = await db.query(sql, [userId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User tidak ditemukan atau bukan role 'user'" });
    }

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
