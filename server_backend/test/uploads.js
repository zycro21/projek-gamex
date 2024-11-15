const fs = require("fs");
const path = require("path");
const db = require("../db"); // Sesuaikan dengan path relatif ke db.js
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function findOrphanedFiles() {
  try {
    // Step 1: Ambil semua file dari folder 'uploads'
    const uploadsFolder = path.join(__dirname, "..", "uploads"); // Menyesuaikan path relatif ke folder 'uploads'
    const filesInUploads = fs.readdirSync(uploadsFolder);

    // Step 2: Ambil semua file yang ada di database
    const [results] = await db.query(
      "SELECT image FROM games WHERE image IS NOT NULL"
    );

    // Step 3: Pastikan format path file yang disimpan di database menggunakan pemisah direktori yang benar
    const filesInDatabase = results.map((row) => {
      // Jika row.image bukan buffer, anggap saja itu string path file
      let imagePath = row.image;

      // Jika data berupa buffer, ubah menjadi string
      if (Buffer.isBuffer(imagePath)) {
        imagePath = imagePath.toString("utf-8"); // Mengonversi Buffer ke string
      }

      // Menormalkan path gambar (menghapus 'uploads/' dan memastikan pemisah direktori yang konsisten)
      return imagePath.replace(/uploads[\/\\]/, "").replace(/\\/g, "/");
    });

    // Step 4: Bandingkan file di folder dengan file di database dan hapus yang tidak ada di database
    const orphanedFiles = filesInUploads.filter((file) => {
      // Menormalkan nama file di folder uploads
      const normalizedFile = file.replace(/\\/g, "/");
      return !filesInDatabase.includes(normalizedFile);
    });

    // Step 5: Jika ada file yang tidak ada di database, konfirmasi untuk menghapusnya
    if (orphanedFiles.length > 0) {
      console.log("File berikut tidak ada di database dan akan dihapus:");
      orphanedFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });

      rl.question(
        "Apakah Anda yakin ingin menghapus file-file ini? (y/n): ",
        (answer) => {
          if (answer.toLowerCase() === "y") {
            orphanedFiles.forEach((file) => {
              const filePath = path.join(uploadsFolder, file);
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error(`Gagal menghapus file: ${filePath}`, err);
                } else {
                  console.log(`File berhasil dihapus: ${filePath}`);
                }
              });
            });
          } else {
            console.log("Pembatalan penghapusan file.");
          }
          rl.close();
        }
      );
    } else {
      console.log("Semua file di folder 'uploads' tercatat dalam database.");
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

// Jalankan fungsi untuk mencari file yang tidak terdaftar di database dan menghapusnya
findOrphanedFiles();