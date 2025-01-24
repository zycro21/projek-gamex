const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("./db");
const { verifyAdminRole } = require("./auth/authAdmin");

// Implementasi ID Unik tanpa uuid dan Membuat Format untuk order_id
const generateUniqueOrderId = async (req, res) => {
  let isUnique = false;
  let order_id;

  while (!isUnique) {
    // Generate order_id
    order_id = `order-${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    // Cek ke Database apakah order_id sudah pernah ada
    const [results] = await db.query(
      "SELECT 1 FROM orders WHERE order_id = ? LIMIT 1",
      [order_id]
    );

    // Jika belum ada, maka order_id tersebut unik
    if (results.length === 0) {
      isUnique = true;
    }
  }

  return order_id;
};

// Membuat Format untuk order_date
const padZero = (num) => String(num).padStart(2, "0"); // Fungsi untuk menambahkan 0 di depan angka 1-9 dan angka memiliki 2 digit
const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Create Order
router.post("/createOrder", verifyAdminRole, async (req, res) => {
  const { user_id, total_price, payment_status } = req.body; // Inisiasi Body dari Method Create Order

  // Validasi 1: Validasi Input
  if (!user_id || !total_price || !payment_status) {
    return res.status(400).json({
      message: "Semua Kolom (Field) Wajib Diisi!",
    });
  }

  // Validasi 2: Validasi Total_Price
  if (total_price <= 0) {
    return res.status(400).json({
      message: "Total Harga harus Bernilai Positif!",
    });
  }

  // Validasi 3: Validasi Payment_Status
  const validStatus = ["completed", "pending", "failed"];
  if (!validStatus.includes(payment_status)) {
    return res.status(400).json({
      message:
        "Status Pembayaran harus salah satu dari: completed, pending, failed",
    });
  }

  try {
    // Cek apakah user_id ada di database pada tabel users
    const [userResults] = await db.query(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id]
    );

    if (userResults.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan!",
      });
    }

    const order_id = await generateUniqueOrderId();
    const formattedDate = formatDate();

    const query = `INSERT INTO orders (order_id, user_id, order_date, total_price, payment_status) VALUES (?, ?, ?, ?, ?)`;
    await db.query(query, [
      order_id,
      user_id,
      formattedDate,
      total_price,
      payment_status,
    ]);

    return res.status(201).json({
      message: "Order berhasil dibuat",
      order_id,
      user_id,
      order_date: formattedDate,
      total_price,
      payment_status,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(500).json({
        message: "order_id duplikat, silahkan coba lagi",
      });
    }
    console.error("Database error", err);
    return res.status(500).json({
      message: "Gagal membuat Order",
      error: err,
    });
  }
});

// Create order_items
router.post("/createOrderItems", async (req, res) => {
  const { order_id, game_id, quantity, price } = req.body;

  // Validasi Input
  if (!order_id || !game_id || !quantity || !price) {
    return res.status(400).json({
      message: "Semua kolom wajib diisi!",
    });
  }

  // Validasi Quantity dan Price adalah angka positif
  if (quantity <= 0 || price <= 0) {
    return res.status(400).json({
      message: "Quantity dan Price harus angka positif!",
    });
  }

  try {
    // Melakukan pemeriksaan apakah order_id sudah ada di database
    const [order] = await db.query(`SELECT * FROM orders WHERE order_id = ?`, [
      order_id,
    ]);

    if (order.length === 0) {
      return res.status(404).json({
        message: "Order ID tidak ditemukan",
      });
    }

    // Melakukan pemeriksaan apakah game_id sudah ada di database
    const [game] = await db.query(`SELECT * FROM games WHERE game_id = ?`, [
      game_id,
    ]);

    if (game.length === 0) {
      return res.status(404).json({
        message: "Game ID Tidak ditemukan",
      });
    }

    // Format order_item_id
    const randomSuffix = Math.floor(
      Math.random() * (10 ** 12 - 10 ** 10) + 10 ** 10
    );
    const orderItemId = `OI-${randomSuffix}`;

    // Query menambahkan item baru
    const query = `
    INSERT INTO order_items (order_item_id, order_id, game_id, quantity, price)
    VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      orderItemId,
      order_id,
      game_id,
      quantity,
      price,
    ]);

    // Melakukan Pengecekan Apakah berhasil ditambahkan
    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Data berhasil ditambahkan ke order_items",
        order_item_id: orderItemId,
      });
    } else {
      return res.status(400).json({
        message: "Data gagal ditambahkan ke order_items",
      });
    }
  } catch (err) {
    console.error("Error saat menambahkan item ke order_items: ", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err,
    });
  }
});

// Fetch All Order from Database (With Pagination and Filter)
router.get("/", verifyAdminRole, async (req, res) => {
  const {
    page = 1,
    payment_status,
    order_date,
    order_date_sort = "DESC", // Parameter untuk urutan order_date
    total_price_sort = "DESC",
    min_total_price,
    max_total_price,
  } = req.query; // Inisiasi query seperti page dan limit

  console.log("Parameter Query yang Diterima: ", req.query);

  const limit = 12; // Inisiasi limit secara permanen
  const offset = (page - 1) * limit; // Hitung offset berdasarkan page dan limit

  // Menyusun Query dan Filter
  let filters = [];
  let queryParams = [];

  // Filter berdasarkan payment_status
  if (payment_status) {
    filters.push("payment_status = ?");
    queryParams.push(payment_status);
  }

  // Filter berdasarkan order_date
  if (order_date) {
    const [startDate, endDate] = order_date.split(":");

    // Melakukan Pemeriksaan Apakah Format Tanggal Valid
    const isValidDate = (date) => !isNaN(new Date(date).getTime());

    if (
      startDate &&
      endDate &&
      isValidDate(startDate) &&
      isValidDate(endDate)
    ) {
      filters.push("DATE(order_date) BETWEEN ? AND ?");
      queryParams.push(startDate, endDate);
    } else if (isValidDate(order_date)) {
      filters.push("DATE(order_date) = ?");
      queryParams.push(order_date);
    } else {
      return res.status(400).json({
        message: "Format Tanggal Tidak Valid!",
      });
    }
  }

  // Filter berdasarkan total_price
  if (min_total_price || max_total_price) {
    if (min_total_price && max_total_price) {
      filters.push("total_price BETWEEN ? AND ?");
      queryParams.push(
        parseFloat(min_total_price),
        parseFloat(max_total_price)
      );
    } else if (min_total_price) {
      filters.push("total_price >= ?");
      queryParams.push(parseFloat(min_total_price));
    } else if (max_total_price) {
      filters.push("total_price <= ?");
      queryParams.push(parseFloat(max_total_price));
    }
  }

  console.log("Filters Applied:", filters); // Debug log
  console.log("Query Parameters for Filters:", queryParams); // Debug log

  // Menyusun Query Utama dengan Filter dan Pagination
  let query = "SELECT * FROM orders";
  if (filters.length > 0) {
    query += " WHERE " + filters.join(" AND ");
  }

  // Validasi Sorting Parameter
  const validSortOptions = ["ASC", "DESC"];
  if (!validSortOptions.includes(order_date_sort.toUpperCase())) {
    return res.status(400).json({
      message:
        "Sorting Parameter untuk order_date Tidak Valid!, Gunakan ASC atau DESC",
    });
  }
  if (!validSortOptions.includes(total_price_sort.toUpperCase())) {
    return res.status(400).json({
      message:
        "Sorting Parameter untuk total_price Tidak Valid!, Gunakan ASC atau DESC",
    });
  }

  // Menambahkan Urutan Berdasarkan order_date dan total_price
  let orderByClause = [];

  // Tambahkan order_date_sort hanya jika eksplisit disediakan
  if (order_date_sort && req.query.hasOwnProperty("order_date_sort")) {
    orderByClause.push(`order_date ${order_date_sort.toUpperCase()}`);
  }

  // Tambahkan total_price_sort jika disediakan
  if (total_price_sort) {
    orderByClause.push(`total_price ${total_price_sort.toUpperCase()}`);
  }

  // Jika tidak ada sorting yang disediakan, maka gunakan default order_date DESC
  if (orderByClause.length === 0) {
    orderByClause.push("order_date DESC");
  }

  // Menggunakan pengurutan default jika tidak ada parameter untuk pengurutan
  query += ` ORDER BY ${orderByClause.join(", ") || "order_date DESC"}`;

  // Menambahkan Pagination ke Query
  query += " LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), offset);

  console.log("Final Query to Execute:", query); // Debug log
  console.log("Final Query Parameters:", queryParams); // Debug log

  try {
    const [results] = await db.query(query, queryParams);
    console.log("Query Results:", results); // Debug log

    // Menyusun response dengan data dan informasi pagination
    const [totalCountResults] = await db.query(
      "SELECT COUNT (*) AS total FROM orders"
    );
    const totalRecords = totalCountResults[0].total;

    res.status(200).json({
      message: "Orders Fetched Successfully",
      data: results,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
      },
    });
  } catch (err) {
    console.error("Database Error: ", err);
    return res.status(500).json({
      message: "Gagal mengambil data order",
      error: err,
    });
  }
});

// Fetch Detail Data by order_id
router.get("/:order_id", verifyAdminRole, async (req, res) => {
  const { order_id } = req.params; // Mendapatkan parameter order_id dari URL

  try {
    // Query untuk mendapatkan data order dan order_item terkait berdasarkan order_id
    const [rows] = await db.query(
      `
        SELECT
        o.order_id, o.user_id, o.order_date, o.total_price, o.payment_status,
        oi.order_item_id, oi.game_id, oi.quantity, oi.price AS item_price,
        g.title, g.image
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN games g ON oi.game_id = g.game_id
        WHERE o.order_id = ?
        `,
      [order_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Data Order Tidak Ditemukan",
      });
    }

    // Menyusun Data ke dalam format json untuk ditampilkan
    const orderDetails = {
      order_id: rows[0].order_id,
      user_id: rows[0].user_id,
      order_date: rows[0].order_date,
      total_price: rows[0].total_price,
      payment_status: rows[0].payment_status,
      items: rows.map((item) => ({
        order_item_id: item.order_item_id,
        game_id: item.game_id,
        game_title: item.title,
        image: item.image,
        quantity: item.quantity,
        item_price: item.item_price,
      })),
    };

    res.status(200).json({
      message: "Berhasil mendapakan detail order",
      orderDetails,
    });
  } catch (err) {
    console.error("Error fetching order details: ", err);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data order",
      error: err.message, // Untuk memberikan detail error pada respons
    });
  }
});

// Update Data Order
router.put("/:order_id", verifyAdminRole, async (req, res) => {
  const { order_id } = req.params;
  const { total_price, payment_status } = req.body;

  // Validasi input body
  if (!total_price && !payment_status) {
    return res.status(400).json({
      message: "Isi setidaknya salah satu kolom",
    });
  }

  // Validasi input tipe data
  if (total_price && isNaN(Number(total_price))) {
    return res.status(400).json({
      message: "Kolom total_price harus berupa angka",
    });
  }

  if (
    payment_status &&
    !["completed", "pending", "failed"].includes(payment_status)
  ) {
    return res.status({
      message:
        "Kolom payment_status hanya dapat berisi completed, pending, atau failed",
    });
  }

  try {
    // Sebelum melakukan update, pastikan data order_id ada di database
    const [existingOrder] = await db.query(
      "SELECT * FROM orders WHERE order_id = ?",
      [order_id]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({
        message: "Order ID tidak dapat ditemukan",
      });
    }

    // Query untuk update
    const fieldsToUpdate = [];
    const queryParams = [];

    if (total_price) {
      fieldsToUpdate.push("total_price = ?");
      queryParams.push(total_price);
    }

    if (payment_status) {
      fieldsToUpdate.push("payment_status = ?");
      queryParams.push(payment_status);
    }

    queryParams.push(order_id); // Menambahkan order_id ke parameter query

    const query = `
        UPDATE orders
        SET ${fieldsToUpdate.join(", ")}
        WHERE order_id = ?
        `;

    // Execute Query
    const [result] = await db.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Gagal mengupdate data order",
      });
    }

    res.status(200).json({
      message: "Sukses Melakukan Update Order",
      updateFields: { total_price, payment_status },
    });
  } catch (err) {
    console.error("Error saat melakukan update", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err,
    });
  }
});

// Menghapus Order
router.delete("/:order_id", verifyAdminRole, async (req, res) => {
  const { order_id } = req.params;

  try {
    // Validasi order_id di tabel orders
    const [existingOrder] = await db.query(
      "SELECT * FROM orders WHERE order_id = ?",
      [order_id]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({
        message: "Order ID tidak ditemukan",
      });
    }

    // Validasi order_id di tabel order_items
    const [existingOrderItems] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order_id]
    );

    if (existingOrderItems.length > 0) {
      // Jika order_id ditemukan di kedua tabel maka hapus yang ada di orders_item terlebih dahulu
      await db.query("DELETE FROM order_items WHERE order_id = ?", [order_id]);
    }

    // Query untuk menghapus data di tabel order
    const query = "DELETE FROM orders WHERE order_id = ?";

    const [result] = await db.query(query, [order_id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Gagal menghapus order",
      });
    }

    res.status(200).json({
      message:
        existingOrderItems.length > 0
          ? "Order berhasil dihapus dari tabel orders dan orders_item"
          : "Order berhasil dihapus dari tabel orders",
      deletedOrderId: order_id,
    });
  } catch (err) {
    console.error("Error saat menghapus order", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err,
    });
  }
});

module.exports = router;
