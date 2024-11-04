const mysql = require('mysql2/promise');

// Mengatur pool koneksi database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'database_project1',
});

// Mengecek koneksi awal dengan query sederhana
async function checkDatabaseConnection() {
    try {
        await db.query('SELECT 1');
        console.log('Koneksi Database Berhasil');
    } catch (err) {
        console.error('Koneksi Database Gagal:', err.code);
    }
}

checkDatabaseConnection();

// Event listener untuk setiap koneksi baru dari pool
db.on('connection', (connection) => {
    console.log('Koneksi baru dibuat dengan ID:', connection.threadId);
});

// Mengekspor objek db untuk digunakan di file lain
module.exports = db;