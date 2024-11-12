const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin"); // Middleware untuk verifikasi admin
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi penyimpanan file dengan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

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
      .isFloat({ min: 0 })
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
    const image = req.file ? req.file.filename : null; // Ambil hanya nama file

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
        image, // Simpan nama file saja di database
      ]);

      res.status(201).json({ message: "Game berhasil ditambahkan" });
    } catch (error) {
      // Jika terjadi kesalahan, hapus file gambar yang sudah diupload
      if (image) {
        fs.unlink(path.join(__dirname, "uploads", image), (err) => {
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

router.get("/", verifyAdminRole, async (req, res) => {
  const { genre, platform, sort, page = 1, limit = 16 } = req.query; // Page dan limit selalu otomatis ada
  const offset = (page - 1) * limit; // Menghitung offset untuk pagination

  try {
    let sql = "SELECT * FROM games";
    let params = [];

    // Menambahkan filter untuk genre
    if (genre) {
      const genres = genre.split(",").map((item) => `%${item.trim()}%`);
      const genreConditions = genres.map(() => "genre LIKE ?").join(" OR ");
      sql += ` WHERE (${genreConditions})`;
      params = params.concat(genres);
    }

    // Menambahkan filter untuk platform
    if (platform) {
      const platforms = platform.split(",").map((item) => `%${item.trim()}%`);
      const platformConditions = platforms
        .map(() => "platform LIKE ?")
        .join(" OR ");
      sql += genre
        ? ` AND (${platformConditions})`
        : ` WHERE (${platformConditions})`;
      params = params.concat(platforms);
    }

    // Menambahkan pengurutan berdasarkan abjad
    if (sort === "title") {
      sql += " ORDER BY title ASC";
    } else if (sort === "title_desc") {
      sql += " ORDER BY title DESC";
    }

    // Query untuk mengambil total data
    const [totalData] = await db.query("SELECT COUNT(*) AS total FROM games");
    const totalGames = totalData[0].total; // Total jumlah game tanpa filter

    // Menambahkan pagination ke query
    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [games] = await db.query(sql, params);

    // Menangani kasus jika genre atau platform tidak ditemukan
    if (games.length === 0) {
      let message = "Genre atau platform tidak ditemukan";
      if (genre && !platform) message = "Genre tidak ditemukan";
      if (!genre && platform) message = "Platform tidak ditemukan";
      return res.status(404).json({ message });
    }

    // Menghitung total halaman berdasarkan total data
    const totalPages = Math.ceil(totalGames / limit);

    // Mengirimkan response dengan informasi pagination
    res.json({
      currentPage: parseInt(page),
      perPage: parseInt(limit),
      totalGames, // Total jumlah game yang ada di database
      totalPages, // Total halaman yang dapat diakses
      games, // Menampilkan hasil game untuk halaman saat ini
    });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

// Endpoint untuk mengupdate game berdasarkan ID
router.put(
  "/updateGames/:gameId",
  verifyAdminRole,
  upload.single("image"),
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
    body("genre")
      .optional()
      .custom((value) => {
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
    const image = req.file ? req.file.filename : null; // Hanya nama file jika ada

    try {
      let updateFields = [];
      let params = [];

      // Cek gambar lama
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

      params.push(gameId);

      if (updateFields.length === 0) {
        return res.status(400).json({ message: "Tidak ada data yang diubah" });
      }

      const sql = `UPDATE games SET ${updateFields.join(
        ", "
      )} WHERE game_id = ?`;
      await db.query(sql, params);

      // Jika ada gambar lama dan baru diupload, hapus gambar lama
      if (oldImage && image && oldImage !== image) {
        fs.unlink(path.join(__dirname, "uploads", oldImage), (err) => {
          if (err) {
            console.error("Gagal menghapus file gambar lama:", err);
          } else {
            console.log("File gambar lama berhasil dihapus");
          }
        });
      }

      res.json({ message: "Data game berhasil diperbarui" });
    } catch (error) {
      // Jika terjadi error, hapus file gambar baru
      if (image) {
        fs.unlink(path.join(__dirname, "uploads", image), (err) => {
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
