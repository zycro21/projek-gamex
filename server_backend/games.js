const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin"); // Middleware untuk verifikasi admin
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

// Endpoint untuk menambah game baru
router.post(
  "/createGames",
  verifyAdminRole,
  upload.single("image"), // Menggunakan multer untuk menangani satu file 'image'
  [
    body("title").notEmpty().withMessage("Judul game tidak boleh kosong"),
    body("description")
      .notEmpty()
      .withMessage("Deskripsi game tidak boleh kosong"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Harga game harus lebih besar dari 0"),
    body("platform").custom((value) => {
      const validPlatforms = [
        "Personal Computer (PC)",
        "Console",
        "Handheld Game Consoles",
        "Mobile Devices",
        "Virtual Reality (VR)",
      ];
      const platforms = value.split(",").map((item) => item.trim());
      platforms.forEach((platform) => {
        if (!validPlatforms.includes(platform)) {
          throw new Error(`Platform '${platform}' tidak valid`);
        }
      });
      return true;
    }),
    body("genre").custom((value) => {
      const validGenres = [
        "Real-Time Strategy",
        "Multiplayer Online Battle Arena",
        "Shooter",
        "Role Playing Game",
        "Sandbox",
        "Simulation",
        "Racing",
        "Sports",
        "Fighting",
        "Action-Adventure",
        "Survival Horror",
        "Puzzler",
        "Rhythm Game",
        "Interactive Movie",
        "Platformer",
      ];
      const genres = value.split(",").map((item) => item.trim());
      genres.forEach((genre) => {
        if (!validGenres.includes(genre)) {
          throw new Error(`Genre '${genre}' tidak valid`);
        }
      });
      return true;
    }),
    body("release_date").isDate().withMessage("Tanggal rilis tidak valid"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, platform, genre, release_date } =
      req.body;
    const image = req.file ? req.file.path : null;

    try {
      // Memastikan platform dan genre dikirim sebagai string yang dipisahkan koma
      const platformValue = platform
        .split(",")
        .map((item) => item.trim())
        .join(",");
      const genreValue = genre
        .split(",")
        .map((item) => item.trim())
        .join(",");

      const sql =
        "INSERT INTO games (title, description, price, platform, genre, release_date, image) VALUES (?, ?, ?, ?, ?, ?, ?)";

      // Menyimpan data ke database
      await db.query(sql, [
        title,
        description,
        price,
        platformValue, // Platform dikirim sebagai string yang dipisahkan koma
        genreValue, // Genre dikirim sebagai string yang dipisahkan koma
        release_date,
        image,
      ]);

      // Jika berhasil, kirim response sukses
      res.status(201).json({ message: "Game berhasil ditambahkan" });
    } catch (error) {
      // Jika terjadi kesalahan, hapus file gambar yang sudah diupload
      if (image) {
        fs.unlink(image, (err) => {
          if (err) {
            console.error("Gagal menghapus file gambar:", err);
          } else {
            console.log("File gambar berhasil dihapus");
          }
        });
      }

      console.error("Terjadi kesalahan:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server", error });
    }
  }
);

// Endpoint untuk mendapatkan semua game
router.get("/getGames", verifyAdminRole, async (req, res) => {
  try {
    const sql = "SELECT * FROM games";
    const [games] = await db.query(sql);
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

// Endpoint untuk mendapatkan game berdasarkan ID
router.get("/getGames/:gameId", verifyAdminRole, async (req, res) => {
  const { gameId } = req.params;

  try {
    const sql = "SELECT * FROM games WHERE game_id = ?";
    const [game] = await db.query(sql, [gameId]);

    // Jika game tidak ditemukan
    if (game.length === 0) {
      return res.status(404).json({ message: "Game tidak ditemukan" });
    }

    res.json(game[0]); // Mengirimkan data game satuan
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

// Endpoint untuk mengupdate game berdasarkan ID
router.put(
  "/updateGames/:gameId",
  verifyAdminRole,
  upload.single("image"), // Menggunakan multer untuk menangani satu file 'image'
  [
    body("title")
      .optional()
      .notEmpty()
      .withMessage("Judul game tidak boleh kosong"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Deskripsi game tidak boleh kosong"),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Harga game harus lebih besar dari 0"),
    body("platform")
      .optional()
      .custom((value) => {
        if (value) {
          const validPlatforms = [
            "Personal Computer (PC)",
            "Console",
            "Handheld Game Consoles",
            "Mobile Devices",
            "Virtual Reality (VR)",
          ];
          const platforms = value.split(",").map((item) => item.trim());
          platforms.forEach((platform) => {
            if (!validPlatforms.includes(platform)) {
              throw new Error(`Platform '${platform}' tidak valid`);
            }
          });
        }
        return true;
      }),
    body("genre")
      .optional()
      .custom((value) => {
        if (value) {
          const validGenres = [
            "Real-Time Strategy",
            "Multiplayer Online Battle Arena",
            "Shooter",
            "Role Playing Game",
            "Sandbox",
            "Simulation",
            "Racing",
            "Sports",
            "Fighting",
            "Action-Adventure",
            "Survival Horror",
            "Puzzler",
            "Rhythm Game",
            "Interactive Movie",
            "Platformer",
          ];
          const genres = value.split(",").map((item) => item.trim());
          genres.forEach((genre) => {
            if (!validGenres.includes(genre)) {
              throw new Error(`Genre '${genre}' tidak valid`);
            }
          });
        }
        return true;
      }),
    body("release_date")
      .optional()
      .isDate()
      .withMessage("Tanggal rilis tidak valid"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gameId } = req.params;
    const { title, description, price, platform, genre, release_date } =
      req.body;
    const image = req.file ? req.file.path : null;

    try {
      let updateFields = [];
      let params = [];

      // Periksa gambar lama di database
      const [existingGame] = await db.query(
        "SELECT image FROM games WHERE game_id = ?",
        [gameId]
      );
      const oldImage =
        existingGame && existingGame.image ? existingGame.image : null;

      if (title) {
        updateFields.push("title = ?");
        params.push(title);
      }
      if (description) {
        updateFields.push("description = ?");
        params.push(description);
      }
      if (price) {
        updateFields.push("price = ?");
        params.push(price);
      }
      if (platform) {
        const platformValue = platform
          .split(",")
          .map((item) => item.trim())
          .join(",");
        updateFields.push("platform = ?");
        params.push(platformValue);
      }
      if (genre) {
        const genreValue = genre
          .split(",")
          .map((item) => item.trim())
          .join(",");
        updateFields.push("genre = ?");
        params.push(genreValue);
      }
      if (release_date) {
        updateFields.push("release_date = ?");
        params.push(release_date);
      }

      if (image) {
        updateFields.push("image = ?");
        params.push(image);
      }

      params.push(gameId); // Menambahkan gameId di akhir untuk klausa WHERE

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "Tidak ada data yang diubah" });
      }

      const sql = `UPDATE games SET ${updateFields.join(
        ", "
      )} WHERE game_id = ?`;
      await db.query(sql, params);

      // Jika ada gambar lama dan gambar baru diupload, hapus gambar lama
      if (oldImage && image && oldImage !== image) {
        fs.unlink(oldImage, (err) => {
          if (err) {
            console.error("Gagal menghapus file gambar lama:", err);
          } else {
            console.log("File gambar lama berhasil dihapus");
          }
        });
      }

      res.json({ message: "Data game berhasil diperbarui" });
    } catch (error) {
      // Jika terjadi kesalahan, hapus file gambar yang sudah diupload
      if (image) {
        fs.unlink(image, (err) => {
          if (err) {
            console.error("Gagal menghapus file gambar:", err);
          } else {
            console.log("File gambar berhasil dihapus");
          }
        });
      }

      console.error("Terjadi kesalahan:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server", error });
    }
  }
);

// Endpoint untuk menghapus game berdasarkan ID
router.delete("/deletegames/:gameId", verifyAdminRole, async (req, res) => {
  const { gameId } = req.params;

  try {
    // Ambil data game berdasarkan gameId untuk mendapatkan nama file gambar
    const [game] = await db.query("SELECT image FROM games WHERE game_id = ?", [
      gameId,
    ]);

    if (game.length === 0) {
      return res.status(404).json({ message: "Game tidak ditemukan" });
    }

    const image = game[0].image;

    // Hapus game dari database
    const sql = "DELETE FROM games WHERE game_id = ?";
    const [result] = await db.query(sql, [gameId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Game tidak ditemukan" });
    }

    // Jika gambar ada, hapus gambar dari folder 'uploads'
    if (image) {
      fs.unlink(image, (err) => {
        if (err) {
          console.error("Gagal menghapus file gambar:", err);
        } else {
          console.log("File gambar berhasil dihapus");
        }
      });
    }

    res.json({ message: "Game berhasil dihapus" });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;
