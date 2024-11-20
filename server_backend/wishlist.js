const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin");
const crypto = require("crypto");
const moment = require("moment");

// Fungsi Create Unique ID
function generateId(prefix) {
  const randomNumbers = crypto.randomInt(1000000000, 999999999999);
  return `${prefix}-${randomNumbers}`; // Angka 9-12 digit
}

// Create Wishlist
router.post(
  "/createWishlist",
  verifyAdminRole,
  [
    body("user_id").notEmpty().withMessage("user_id wajib ada"),
    body("game_id")
      .isArray()
      .withMessage("game_id harus berupa array")
      .notEmpty()
      .withMessage("game_id wajib diisi"),
    body("title_wishlist")
      .notEmpty()
      .withMessage("Kolom title_wishlist wajib diisi"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { user_id, title_wishlist, game_id } = req.body;

    try {
      // Validasi user_id
      const userQuery = "SELECT * FROM users WHERE user_id = ?";
      const userResult = await db.query(userQuery, [user_id]);

      if (userResult.rowCount === 0) {
        return res.status(404).json({
          message: "User ID tidak ditemukan",
        });
      }

      // Validasi game_id secara individu
      const invalidsGameId = [];
      for (let game in game_id) {
        const gameQuery = "SELECT * FROM games WHERE game_id = ?";
        const gameResult = await db.query(gameQuery, [game]);

        if (gameResult.rowCount === 0) {
          invalidsGameId.push(game); // Menyimpan game_id yang tidak valid
        }
      }

      if (invalidsGameId.length > 0) {
        return res.status(404).json({
          message: `Game ID Berikut tidak ditemukan: ${invalidsGameId.join(", ")}`,
        });
      }

      // Create unique wishlist_id
      const wishlist_id = generateId("WI");

      // Get Date and Time Now
      const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

      // Tambahkan entry ke tabel wishlist
      const insertWishlistQuery = `INSERT INTO wishlist (wishlist_id, user_id, title_wishlist, created_at) VALUES (?, ?, ?, ?)`;
      const result = await db.query(insertWishlistQuery, [
        wishlist_id,
        user_id,
        title_wishlist,
        createdAt,
      ]);

      // Menambahkan game ke wishlist games
      const insertWishlistGames = `INSERT INTO wishlist_games (wishlist_games_id, wishlist_id, game_id) VALUES (?, ?, ?)`;

      for (let game of game_id) {
        const wishlist_games_id = generateId("WGI");
        const result2 = await db.query(insertWishlistGames, [wishlist_games_id, wishlist_id, game]);
      }

      res.status(201).json({
        message: "Wishlist Berhasil Dibuat",
        wishlist_id: wishlist_id,
        title_wishlist: title_wishlist,
        game_id: game_id,
        createdAt: createdAt,
      });
    } catch (err) {
      res.status(500).json({
        message: "Gagal Membuat Wishlist",
        error: err.message,
      });
    }
  }
);

module.exports = router;
