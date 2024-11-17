const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./user"); // Mengimpor file user.js
const adminRoutes = require("./admin");
const superadminRoutes = require("./superadmin");
const gamesRoutes = require("./games");
const reviewRoutes = require("./review")
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 5000;

// Konfigurasi CORS untuk mengizinkan semua origin dan kredensial
const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true, // Mengizinkan pengiriman cookies
};

app.use(cors(corsOptions)); // Gunakan konfigurasi CORS yang baru

// Middleware lainnya
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API Berhasil Diakses");
});

// Menambahkan route lainnya
app.use("/admin", adminRoutes);
app.use("/superadmin", superadminRoutes);
app.use("/games", gamesRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/review", reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
