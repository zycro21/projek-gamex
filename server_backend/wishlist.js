const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin");
const crypto = require("crypto");
const moment = require("moment");
const { error } = require("console");
const { route } = require("./user");

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
          message: `Game ID Berikut tidak ditemukan: ${invalidsGameId.join(
            ", "
          )}`,
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
        const result2 = await db.query(insertWishlistGames, [
          wishlist_games_id,
          wishlist_id,
          game,
        ]);
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

// Fetch atau Menampilkan Data ALL
router.get("/", verifyAdminRole, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Validasi Input Query
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (
    isNaN(parsedPage) ||
    isNaN(parsedLimit) ||
    parsedPage <= 0 ||
    parsedLimit <= 0
  ) {
    return res.status(400).json({
      message: "Parameter Page dan Limit harus berupa angka positif",
    });
  }

  try {
    // Offset untuk pagination
    const offset = (parsedPage - 1) * parsedLimit;

    // Query untuk fetch total wishlist
    const countQuery = "SELECT COUNT(*) AS total FROM wishlist";
    const [countResult] = await db.query(countQuery);

    if (!countResult || countResult.length === 0 || !countResult[0].total) {
      return res.status(404).json({
        message: "Belum ada wishlist yang tersedia",
        metadata: {
          totalItems: 0,
          currentPage: parsedPage,
          totalPages: 0,
        },
        data: [],
      });
    }

    const totalItems = countResult[0].total;

    // Perhitungan Total Pages
    const totalPages = Math.ceil(totalItems/parsedLimit);
    console.log("Total Pages Calculated: ", totalPages)

    // Query fetch wishlist dengan pagination
    const query = `
    SELECT wishlist_id, user_id, title_wishlist, created_at
    FROM wishlist
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `;

    const [wishlistResult]= await db.query(query, [parsedLimit, offset]);

    res.status(200).json({
      message: "Daftar Wishlist Berhasil Didapatkan",
      metadata: {
        totalItems: totalItems,
        currentPage: parsedPage,
        totalPages: totalPages,
      },
      data: wishlistResult.map((item) => ({
        wishlist_id: item.wishlist_id,
        user_id: item.user_id,
        title_wishlist: item.title_wishlist,
        created_at: item.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({
      message: "Gagal mendapatkan daftar wishlist",
      error: err.message,
    });
  }
});

// Fetch Detail wishlist by wishlist_id
router.get("/:wishlist_id", verifyAdminRole, async (req, res) => {
  const { wishlist_id } = req.params;
  const { gamePage = 1, gameLimit = 5 } = req.query;

  try {
    // Query fetch wishlist detail
    const wishlistQuery = `
    SELECT wishlist_id, user_id, title_wishlist, created_at
    FROM wishlist
    WHERE wishlist_id = ?
    `;

    const wishlistResult = await db.query(wishlistQuery, [wishlist_id]);

    if (wishlistResult.length === 0) {
      return res.status(404).json({
        message: "Wishlist dengan ID tersebut tidak dapat ditemukan",
      });
    }

    // Validasi dan Konversi Pagination untuk Game
    const parsedGamePage = parseInt(gamePage, 10);
    const parsedGameLimit = parseInt(gameLimit, 10);

    if (
      isNaN(parsedGamePage) ||
      isNaN(parsedGameLimit) ||
      parsedGamePage <= 0 ||
      parsedGameLimit <= 0
    ) {
      return res.status(400).json({
        message: "Parameter gamePage dan gameLimit harus berupa angka positif",
      });
    }

    const offset = (parsedGamePage - 1) * parsedGameLimit;

    // Query fetch daftar game pada tabel wishlist_games by wishlist_id
    const gamesQuery = `
    SELECT g.game_id, g.title, g.image
    FROM games g
    JOIN wishlist_games wg ON g.game_id = wg.game_id
    WHERE wg.wishlist_id = ?
    LIMIT ? OFFSET ?
    `;

    const gameResult = (
      await db.query(gamesQuery, [wishlist_id, parsedGameLimit, offset])
    )[0];

    // Query menghitung total jumlah game dalam wishlist
    const countGameQuery = `
    SELECT COUNT(*) AS total FROM games g
    JOIN wishlist_games wg ON g.game_id = wg.game_id
    WHERE wg.wishlist_id = ?
    `;

    const countGameResult = await db.query(countGameQuery, [wishlist_id]);
    const totalGames = countGameQuery.length > 0 ? countGameResult[0].total : 0;

    // Jika tidak ada game dalam wishlist
    if (gameResult.length === 0) {
      return res.status(404).json({
        message: "Tidak ada game dalam wishlist ini",
      });
    }

    // Total halaman untuk game
    const totalGamePages =
      totalGames > 0 ? Math.ceil(totalGames / parsedGameLimit) : 0;

    res.status(200).json({
      message: "Berhasil mendapatkan detail wishlist",
      wishlist: wishlistResult[0],
      metadata: {
        totalGames,
        currentGamePage: parsedGamePage,
        totalGamePages,
      },
      game: gameResult.map((item) => ({
        id: item.game_id,
        title: item.title,
        image: item.image,
      })),
    });
  } catch (err) {
    console.error(err); // Log error untuk debugging
    return res.status(500).json({
      message: "Gagal mendapatkan detail wishlist",
      error: err.message,
    });
  }
});

// Update wishlist_id
router.put("/:wishlist_id", verifyAdminRole, async (req, res) => {
  const { wishlist_id } = req.params;
  const { title_wishlist } = req.body;

  // Validasi Input
  if (!title_wishlist || title_wishlist.trim() === "") {
    return res.status(400).json({
      message: "title wishlist tidak boleh kosong",
    });
  }

  try {
    // Validasi Apakah wishlist_id ada di database (tabel wishlist);
    const [wishlistCheck] = await db.query(
      "SELECT wishlist_id FROM wishlist WHERE wishlist_id = ?",
      [wishlist_id]
    );

    if (wishlistCheck.length === 0) {
      return res.status(404).json({
        message: "Wishlist ID tidak dapat ditemukan",
      });
    }

    // Update title wishlist
    const updateQuery = `UPDATE wishlist SET title_wishlist = ?, updated_at = NOW() WHERE wishlist_id = ?`;
    await db.query(updateQuery, [title_wishlist, wishlist_id]);

    res.status(200).json({
      message: "Update Title Wishlist Berhasil",
      wishlist_id,
      title_wishlist,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Gagal Update Title Wishlist",
      error: err.message,
    });
  }
});

// Update (menambah) game di wishlist_id
router.put("/plus/:wishlist_id", verifyAdminRole, async (req, res) => {
  const { wishlist_id } = req.params;
  const { game_id } = req.body;

  // Validasi input
  if (!Array.isArray(game_id) || !game_id.length === 0) {
    return res.status(400).json({
      message: "game_id harus berupa array yang berisi setidaknya 1 game_id",
    });
  }

  try {
    // Cek apakah wishlist ID ada
    const wishlistQuery = `SELECT * FROM wishlist WHERE wishlist_id = ?`;
    const wishlistResult = await db.query(wishlistQuery, [wishlist_id]);

    if (wishlistResult.length === 0) {
      return res.status(404).json({
        message: "Wishlist ID tidak ditemukan",
      });
    }

    // Cek apakah game sudah ada dalam tabel wishlist_games
    const existingGameQuery = `SELECT * FROM wishlist_games WHERE wishlist_id = ? AND game_id IN (?)`;
    const existingGameResult = await db.query(existingGameQuery, [
      wishlist_id,
      game_id,
    ]);

    // Ekstrak daftar game_id yang sudah ada
    const existingGameId = existingGameResult.map((game) => game.game_id);

    // Filter game_id sehingga hanya menambahkan yang belum ada
    const newGameId = game_id.filter((id) => !existingGameId.includes(id));

    if (newGameId.length === 0) {
      return res.status(200).json({
        message:
          "Semua game sudah ada di dalam wishlist ini, tidak ada yang perlu ditambahkan",
      });
    }

    // Tambahkan game yang belum ada ke wishlist
    const addGameQuery = `INSERT INTO wishlist_games (wishlist_games_id, wishlist_id, game_id) VALUES ${newGameId
      .map(() => "(?, ?, ?)")
      .join(", ")}`;

    // Buat wishlist_games_id unik untuk setiap game
    const addGameParams = newGameId.flatMap((id) => [
      generateId("WGI"),
      wishlist_id,
      id,
    ]);
    await db.query(addGameQuery, addGameParams);

    // Update kolom updated_at di tabel wishlist
    const updateWishlist = `UPDATE wishlist SET updated_at = NOW() WHERE wishlist_id = ?`;
    await db.query(updateWishlist, [wishlist_id]);

    return res.status(200).json({
      message: `${newGameId.length} game berhasil ditambahkan ke wishlist`,
      addedGames: newGameId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Gagal Menambahkan Game ke Wishlist",
      error: err.message,
    });
  }
});

// Update (mengurangi) game di wishlist_id
router.put("/minus/:wishlist_id", verifyAdminRole, async (req, res) => {
  const { wishlist_id } = req.params;
  const { game_id } = req.body;

  // Validasi Input
  if (!Array.isArray(game_id) || game_id.length === 0) {
    return res.status(400).json({
      message: "Game_ID harus berupa array dan setidaknya berisi 1 game_id",
    });
  }

  try {
    // Validasi wishlist_id di database
    const wishlistQuery = `SELECT * FROM wishlist WHERE wishlist_id = ?`;
    const wishlistResult = await db.query(wishlistQuery, [wishlist_id]);

    if (wishlistResult.length === 0) {
      return res.status(404).json({
        message: "Wishlist ID tidak dapat ditemukan",
      });
    }

    // Placeholder dinamis untuk klausa IN di SQL
    const placeholders = game_id.map(() => "?").join(",");
    const selectQuery = `SELECT game_id FROM wishlist_games WHERE wishlist_id = ? AND game_id IN (${placeholders})`;

    // Gabungkan Parameter Query
    const params = [wishlist_id, ...game_id];
    const [existingGameResult] = await db.query(selectQuery, params);

    console.log("Hasil existingGameResult:", existingGameResult);

    // Ekstrak Daftar game_id yang cocok
    const existingGameId = existingGameResult
      .map((game) => game.game_id || null)
      .filter(Boolean);
    const gameToRemove = game_id.filter((id) => existingGameId.includes(id));

    if (gameToRemove.length === 0) {
      return res.status(404).json({
        message: "Tidak ada game yang ada dalam wishlist untuk dihapus",
      });
    }

    // Hapus Game dari wishlist_games berdasarkan game_id dan wishlist_id
    const deletePlaceholders = gameToRemove.map(() => "?").join(",");
    const deleteGameQuery = `DELETE FROM wishlist_games WHERE wishlist_id = ? AND game_id IN (${deletePlaceholders})`;
    await db.query(deleteGameQuery, [wishlist_id, ...gameToRemove]);

    // Update kolom updated_at di tabel wishlist
    const updateWishlist = `UPDATE wishlist SET updated_at = NOW() WHERE wishlist_id = ?`;
    await db.query(updateWishlist, [wishlist_id]);

    res.status(200).json({
      message: `${gameToRemove.length} game berhasil dihapus dari wishlist`,
      removedGames: gameToRemove,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal Menghapus Game",
      error: err.message,
    });
  }
});

// Menghapus wishlist total
router.delete("/:wishlist_id", verifyAdminRole, async (req, res) => {
  const { wishlist_id } = req.params;

  try {
    // Validasi apakah wishlist_id ada di database
    const [wishlistCheck] = await db.query(
      "SELECT wishlist_id FROM wishlist WHERE wishlist_id = ?",
      [wishlist_id]
    );

    if (wishlistCheck.length === 0) {
      return res.status(404).json({
        message: "Wishlist ID tidak dapat ditemukan",
      });
    }

    // Hapus semua data game dari wishlist_games yang terkait dengan wishlist_id
    await db.query("DELETE from wishlist_games WHERE wishlist_id = ?", [
      wishlist_id,
    ]);

    // Hapus data wishlist_id dari tabel wishlist
    await db.query("DELETE from wishlist WHERE wishlist_id = ?", [wishlist_id]);

    res.status(200).json({
      message: `Data wishlist dengan ID ${wishlist_id} dan semua game terkait berhasil dihapus`,
    });
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: "Gagal menghapus data wishlist",
      error: err.message,
    });
  }
});

module.exports = router;
