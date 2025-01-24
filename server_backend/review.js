const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin");

// Create Review
router.post("/createReviews", verifyAdminRole, async (req, res, next) => {
  const { user_id, game_id, rating, review_text } = req.body;

  // Validasi 1: Periksa apakah ada field body yang kosong
  if (!user_id || !game_id || !rating || !review_text) {
    return res.status(400).json({
      message: "Semua Field Body Wajib Diisi",
    });
  }

  // Validasi 2: Input rating hanya bisa angka antara 1 dan 10, namun bisa desimal (contoh: 2.1, 5.3, 7)
  const ratingRegex = /^(?:[1-9](?:\.\d+)?|10(?:\.0+)?)$/;
  if (!ratingRegex.test(rating)) {
    return res.status(400).json({
      message: "Rating harus diantara angka 1-10, boleh bulat maupun desimal",
    });
  }

  try {
    // Validasi 3: Cek apakah user_id ada di tabel users
    const [userResults] = await db.query(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id]
    );
    if (userResults.length === 0) {
      return res.status(404).json({
        message: "ID User Tidak Ditemukan",
      });
    }

    // Validasi 4:
    const [gameResults] = await db.query(
      "SELECT * FROM games WHERE game_id = ?",
      [game_id]
    );
    if (gameResults.length === 0) {
      return res.status(404).json({
        message: "ID Game Tidak Ditemukan",
      });
    }

    // Membuat review_id dengan format "review-...."
    const review_id = `review-${Math.floor(
      10000000000 + Math.random() * 90000000000
    )}`;

    //  Mendapatkan Tanggal dan Waktu Saat ini
    const now = new Date();
    const review_date = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    const query = `INSERT INTO reviews (review_id, user_id, game_id, rating, review_text, review_date) VALUES (?, ?, ?, ?, ?, ?)`;

    // Menyimpan review ke database
    await db.query(query, [
      review_id,
      user_id,
      game_id,
      rating,
      review_text,
      review_date,
    ]);

    res.status(201).json({
      message: "Review Berhasil Ditambah",
      review_id,
      review_date,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      message: "Gagal Menambahkan Review",
      error: err,
    });
  }
});

// Fetch All Review (Pagination and Search)
router.get("/", verifyAdminRole, async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || "";

  // Validasi 1: Pastikan parameter query page dan limit adalah angka positif
  if (page <= 0 || limit <= 0) {
    return res.status(400).json({
      message: "Page dan Limit harus angka positif",
    });
  }

  // Hitung Offset Untuk Pagination
  const offset = (page - 1) * limit;

  // Query untuk menghitung total review yang sesuai dengan pencarian
  const countQuery = `SELECT COUNT(*) AS totalReviews FROM reviews WHERE review_text LIKE ? OR user_id LIKE ?`;

  try {
    // Menggunakan Like untuk Pencarian berdasarkan parameter review_text atau user_id
    const [countResult] = await db.query(countQuery, [
      `%${search}%`,
      `%${search}%`,
    ]);
    const totalReviews = countResult[0].totalReviews;

    // Query untuk mengambil data review dengan pagination dan pencarian
    const fetchQuery = `SELECT * FROM reviews WHERE review_text LIKE ? OR user_id LIKE ? LIMIT ? OFFSET ?`;

    // Ambil data reviews dari database
    const [reviews] = await db.query(fetchQuery, [
      `%${search}%`,
      `%${search}%`,
      limit,
      offset,
    ]);

    // Menghitung Total Halaman
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      pagination: {
        page,
        limit,
        totalReviews,
        totalPages,
      },
      message: "Data Review berhasil Ditampilkan",
      data: reviews,
    });
  } catch (err) {
    console.error("Database error: ", err);
    return res.status(500).json({
      message: "Data Review Gagal Ditampilkan",
      error: err,
    });
  }
});

// Get Distribusi Rating per Game
router.get("/ratings-distribution", verifyAdminRole, async (req, res) => {
  try {
    const query = `SELECT game_id, rating, COUNT(*) AS count FROM reviews GROUP BY game_id, rating ORDER BY game_id ASC, rating ASC`;

    const [results] = await db.query(query);

    // Transform Hasil Query menjadi Struktur yang rapi
    const distribution = {};

    results.forEach((row) => {
      const { game_id, rating, count } = row;
      if (!distribution[game_id]) {
        distribution[game_id] = Array(10).fill(0);
      }

      const index = Math.floor(rating) - 1;
      if (index >= 0 && index < 10) {
        distribution[game_id][index] += count;
      }
    });

    res.status(200).json({
      message: "Distribusi Rating Per Game Berhasil Diambil",
      data: distribution,
    });
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).json({
      message: "Gagal Mengambil Data Distribusi Rating Per Game",
      error: err,
    });
  }
});

// Fetch Review Detail (By Detail ID)
router.get("/:review_id", verifyAdminRole, async (req, res) => {
  const { review_id } = req.params; // Mengambil review_id dari parameter URL

  // Validasi Format review_id dari database
  if (!/^review-\d+$/.test(review_id)) {
    return res.status(400).json({
      message: "Format ID Review tidak valid",
    });
  }

  try {
    // Query untuk mengambil review berdasarkan ID
    const query = `
    SELECT 
    reviews.*, 
    users.username AS user_name, 
    games.title AS game_title 
    FROM reviews 
    JOIN users ON reviews.user_id = users.user_id 
    JOIN games ON reviews.game_id = games.game_id 
    WHERE reviews.review_id = ?`;

    const [results] = await db.query(query, [review_id]);

    // Jika tidak ditemukan, kirimkan respon 404 (not found)
    if (results.length === 0) {
      return res.status(404).json({
        message: "Review ID Tidak Ditemukan",
      });
    }

    // Jika ditemukan, kirimkan data review
    res.status(200).json({
      message: "Data Review Berhasil Ditemukan",
      status: "success",
      data: results[0], // Mengambil Review Objek Pertama (karena unik atau hanya ada 1)
    });
  } catch (err) {
    console.error("Database Error: ", err);
    return res.status(500).json({
      message: "Terjadi Kesalahan saat Mengambil Data Review",
      error: err,
    });
  }
});

// Memperbarui Review berdasarkan review_id (walaupun endpoint ini cenderung tidak akan digunakan)
router.put("/:review_id", verifyAdminRole, async (req, res) => {
  const { review_id } = req.params; // Mengambil review_id dari parameter URL
  const { rating, review_text } = req.body; // Mengambil rating dan review_text dari body request

  // Validasi 1: Pastikan Format review_id yang digunakan sebagai parameter valid
  if (!/^review-\d+$/.test(review_id)) {
    return res.status(400).json({
      message: "Format ID Review tidak valid",
    });
  }

  // Validasi 2: Boleh mengisi body salah satu saja
  if (!rating && !review_text) {
    return res.status(400).json({
      message: "Isi setidaknya salah satu kolom untuk melakukan pembaruan",
    });
  }

  // Validasi 3: Memastikan Rating adalah angka antara 1-10 (Boleh desimal maupun bulat)
  const ratingRegex = /^(?:[1-9](?:\.\d+)?|10(?:\.0+)?)$/;
  if (rating && !ratingRegex.test(rating)) {
    return res.status(400).json({
      message:
        "Rating harus berupa angka antara 1-10, Boleh Gunakan Desimal maupun Bilangan Bulat",
    });
  }

  try {
    // Query untuk memastikan review dengan review_id ada
    const checkQuery = "SELECT * FROM reviews WHERE review_id = ?";
    const [checkResults] = await db.query(checkQuery, [review_id]);

    // Jika tidak ditemukan, kirimkan respon 404 (not found)
    if (!checkResults.length === 0) {
      return res.status(404).json({
        message: "ID Review tidak ditemukan",
      });
    }

    // Handling Jika data yang ingin diperbarui ternyata sama dengan data yang ada di database
    const currentReview = checkResults[0];
    if (
      rating &&
      currentReview.rating === parseFloat(rating) &&
      review_text &&
      currentReview.review_text === review_text
    ) {
      return res.status(400).json({
        message:
          "Data yang ingin diperbarui sama dengan data saat ini, Tidak ada perubahan data",
      });
    }

    // Buat Array untuk kolom yang akan diperbarui (Ini digunakan untuk optimasi, yakni jika kolom yang diperbarui hanya 1 maka kolom tersebut yang akan diupdate)
    const updates = [];
    const values = [];

    // Tambahkan kolom berdasarkan input
    if (rating) {
      updates.push("rating = ?");
      values.push(rating);
    }
    if (review_text) {
      updates.push("review_text = ?");
      values.push(review_text);
    }

    // Gabungkan kolom-kolom untuk Query
    const updateQuery = `
        UPDATE reviews 
        SET ${updates.join(", ")} 
        WHERE review_id = ?`;

    values.push(review_id);

    // Jalankan Query untuk memperbarui data review
    await db.query(updateQuery, values);

    // Query untuk mendapatkan data terbaru setelah pembaruan
    const [updatedReview] = await db.query(
      "SELECT * FROM REVIEWS where review_id = ?",
      [review_id]
    );

    res.status(200).json({
      message: "Data Berhasil Di-Update",
      updatedData: updatedReview[0], // [0] menunjukkan kalau ini mengambil data pertama karena bersifat unik
    });
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      return res.status(400).json({
        message: "Ada Kesalahan dalam Input Data",
        error: err.message,
      });
    }
    console.error("Database Error: ", err);
    return res.status(500).json({
      message: "Terjadi Kesalahan saat Memperbarui Review",
      error: err.message,
    });
  }
});

// Menghapus Review
router.delete("/:review_id", verifyAdminRole, async (req, res) => {
  const { review_id } = req.params; // Mengambil review_id dari parameter URL

  // Validasi 1: Pastikan format review_id adalah format yang valid
  if (!/^review-\d+$/.test(review_id)) {
    return res.status(400).json({
      message: "Format ID Review Tidak Valid",
    });
  }

  try {
    // Query untuk memastikan review dengan review_id ada
    const checkQuery = "SELECT * FROM reviews WHERE review_id = ?";
    const [checkResults] = await db.query(checkQuery, [review_id]);

    // Jika tidak ditemukan, maka kirimkan respon 404 (not found)
    if (checkResults.length === 0) {
      return res.status(404).json({
        message: "Review Tidak Ditemukan",
      });
    }

    // Log Untuk Melihat Siapa yang Melakukan Hapus Review
    const { user_id } = req.user;
    console.log(`User ${user_id} is attempting to delete review ${review_id}`);

    // Jika ditemukan, maka lanjutkan untuk menghapus Review
    const deleteQuery = "DELETE FROM reviews WHERE review_id = ?";
    await db.query(deleteQuery, [review_id]);

    // Jika Berhasil maka kirimkan respon sukses
    res.status(200).json({
      message: "Review Berhasil Dihapus",
      deletedReviewID: review_id,
      deletedBy: req.user.username,
      deletedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Duplicate Entry Error",
      });
    }
    console.error("Database Error: ", err);
    return res.status(500).json({
      message: "Terjadi Kesalahan Saat Menghapus Review",
    });
  }
});

module.exports = router;
