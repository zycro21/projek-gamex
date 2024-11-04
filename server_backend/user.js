const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { authenticateJWT } = require("./auth/middleware");
const nodemailer = require("nodemailer");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const RESET_PASSWORD_TOKEN_SECRET = process.env.RESET_PASSWORD_TOKEN_SECRET;

// Register
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Format email tidak valid")
      .custom(async (value) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [results] = await db.query(sql, [value]);
        if (results.length > 0) {
          throw new Error("Email sudah terdaftar");
        }
      }),
    body("username")
      .notEmpty()
      .withMessage("Username tidak boleh kosong")
      .custom(async (value) => {
        const sql = "SELECT * FROM users WHERE username = ?";
        const [results] = await db.query(sql, [value]);
        if (results.length > 0) {
          throw new Error("Username sudah digunakan");
        }
      }),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password harus memiliki minimal 6 karakter")
      .matches(/\d/)
      .withMessage("Password harus mengandung setidaknya satu angka")
      .matches(/[a-zA-Z]/)
      .withMessage("Password harus mengandung setidaknya satu huruf")
      .matches(/[A-Z]/)
      .withMessage("Password harus mengandung setidaknya satu huruf kapital"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((err) => err.msg), // Hanya mengembalikan pesan kesalahan
      });
    }

    const { email, password, username } = req.body;

    // Buat UUID untuk userId
    const userId = `usergamex-${uuidv4().replace(/-/g, "").substring(0, 15)}`;

    try {
      // Hash password sebelum menyimpannya
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql =
        "INSERT INTO users (user_id, email, password, username, created_at) VALUES (?, ?, ?, ?, NOW())";
      await db.query(sql, [userId, email, hashedPassword, username]);
      res.status(201).json({ message: "Register Berhasil", userId });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Format email tidak valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password tidak boleh kosong"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    try {
      console.time("Database Query");
      const [results] = await db.query(sql, [email]);
      console.timeEnd("Database Query");

      if (results.length === 0) {
        return res
          .status(401)
          .json({ message: "Email atau Password Tidak Ditemukan" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Email atau Password Salah" });
      }

      const token = jwt.sign(
        {
          userId: user.user_id,
          email: user.email,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ message: "Login Berhasil", token });
    } catch (error) {
      console.error("Error selama login:", error);
      res.status(500).send(error);
    }
  }
);

// Route yang dilindungi
router.get("/protected", authenticateJWT, (req, res) => {
  res.json({
    message: "Ini route yang dilindungi",
    user: {
      userId: req.user.userId,
      email: req.user.email,
      username: req.user.username,
    },
  });
});

// Akses Profil User
router.get("/profile", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const sql =
    "SELECT user_id, email, username, created_at FROM users WHERE user_id = ?";

  try {
    const [results] = await db.query(sql, [userId]);
    if (results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(results[0]);
  } catch (error) {
    console.error("Error mengakses profil:", error); // Menampilkan error di terminal
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Profil User
router.put("/profile/update", authenticateJWT, async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.userId;

  const checkSql =
    "SELECT * FROM users WHERE (email = ? OR username = ?) AND user_id != ?";
  const [checkResults] = await db.query(checkSql, [email, username, userId]);

  if (checkResults.length > 0) {
    return res.status(400).json({
      message: "Email atau username sudah digunakan oleh pengguna lain.",
    });
  }

  const sql =
    "UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE user_id = ?";

  try {
    const [results] = await db.query(sql, [username, email, userId]);

    // Cek apakah ada baris yang diperbarui
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error memperbarui profil:", error); // Menampilkan error di terminal
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update atau Ganti Password (Jika Ingat Password Lama)
router.put(
  "/change-password",
  authenticateJWT,
  [
    body("oldPassword")
      .notEmpty()
      .withMessage("Password lama tidak boleh kosong"), // Pastikan password lama tidak kosong
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password baru harus memiliki minimal 6 karakter")
      .matches(/\d/)
      .withMessage("Password baru harus mengandung setidaknya satu angka")
      .matches(/[a-zA-Z]/)
      .withMessage("Password baru harus mengandung setidaknya satu huruf")
      .matches(/[A-Z]/)
      .withMessage(
        "Password baru harus mengandung setidaknya satu huruf kapital"
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Mengembalikan pesan kesalahan spesifik
      return res.status(400).json({
        errors: errors.array().map((err) => err.msg), // Mengembalikan array pesan kesalahan
      });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const sql = "SELECT password FROM users WHERE user_id = ?";
    try {
      const [results] = await db.query(sql, [userId]);

      if (results.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const user = results[0];

      // Membandingkan password lama
      const isMatch = await bcrypt.compare(oldPassword.trim(), user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Password lama salah" });
      }

      // Meng-hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updateSql = "UPDATE users SET password = ? WHERE user_id = ?";
      await db.query(updateSql, [hashedNewPassword, userId]);

      res.json({ message: "Password berhasil diubah" });
    } catch (error) {
      console.error("Error saat mengganti password:", error); // Menampilkan error di terminal
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Update atau Ganti Password Jika Lupa Password Lama
// Konfigurasi NodeMailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Minta Reset Password (Mengirim Link Via Email)
router.post(
  "/request-password-reset",
  [body("email").isEmail().withMessage("Format email tidak valid")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    // Buat token reset
    const user = results[0];
    const resetToken = jwt.sign(
      { userId: user.user_id },
      RESET_PASSWORD_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Link untuk reset password
    const resetLink = `http://localhost:5000/api/reset-password/${resetToken}`;

    // Kirim email
    const mailOptions = {
      from: '"Your App" <your-email@example.com>',
      to: email,
      subject: "Permintaan Reset Password",
      text: `Klik link berikut untuk mereset password Anda: ${resetLink}`,
      html: `<p>Klik link berikut untuk mereset password Anda:</p><a href="${resetLink}">Reset Password</a>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "Link reset password telah dikirim ke email Anda" });
    } catch (error) {
      console.error("Error saat mengirim email:", error);
      res.status(500).json({ message: "Gagal mengirim email reset password" });
    }
  }
);

// Atur Ulang Password
router.post(
  "/reset-password/:token",
  [
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password baru minimal 6 karakter")
      .matches(/\d/)
      .withMessage("Password baru harus mengandung setidaknya satu angka")
      .matches(/[A-Z]/)
      .withMessage(
        "Password baru harus mengandung setidaknya satu huruf kapital"
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { newPassword } = req.body;

    // Verifikasi token reset
    let payload;
    try {
      payload = jwt.verify(token, RESET_PASSWORD_TOKEN_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Token tidak valid atau telah kadaluwarsa" });
    }

    const userId = payload.userId;

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const sql = "UPDATE users SET password = ? WHERE user_id = ?";

    try {
      await db.query(sql, [hashedNewPassword, userId]);
      res.json({ message: "Password berhasil diatur ulang" });
    } catch (error) {
      console.error("Error saat mengatur ulang password:", error);
      res.status(500).json({ message: "Gagal mengatur ulang password" });
    }
  }
);

// Log-Out dan Blacklist Token
router.post("/logout", authenticateJWT, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Ambil token dari header
  const sql = "INSERT INTO token_blacklist (token) VALUES (?)";

  try {
    await db.query(sql, [token]);

    // Periksa jumlah token dalam blacklist
    const countSql = "SELECT COUNT(*) as count FROM token_blacklist";
    const [countResult] = await db.query(countSql);
    const tokenCount = countResult[0].count;

    // Jika jumlah token mencapai 1000, hapus semua token di blacklist
    if (tokenCount >= 1000) {
      const deleteSql = "DELETE FROM token_blacklist";
      await db.query(deleteSql);
    }

    res.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Error saat logout:", error);
    res.status(500).send(error);
  }
});

module.exports = router;
