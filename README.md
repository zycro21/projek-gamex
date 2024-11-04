# GAMEX

__Game-X__ adalah aplikasi berbasis web yang digunakan sebagai tempat melakukan penjualan dan pembelian untuk game. Aplikasi ini dibangun dengan arsitektur full-stack menggunakan MySQL sebagai database, Node.js dengan Express sebagai backend, dan React sebagai frontend. Berikut adalah deskripsi lebih detail mengenai teknologi yang digunakan dan fitur-fitur yang disediakan oleh Game-X.

## Teknologi yang digunakan
- __MySQL__ : Digunakan untuk menyimpan dan mengelola data aplikasi seperti informasi pengguna, data game, order, review, dan wishlist. Struktur database dirancang untuk mendukung skala besar dan memastikan data dapat diakses secara efisien.
- __Node.js dengan Express__ : Sebagai backend, Node.js dan Express bertanggung jawab atas API server untuk menangani permintaan dari frontend, autentikasi pengguna, validasi data, dan komunikasi dengan database MySQL.
- __React.JS__ : Digunakan sebagai frontend untuk menyediakan antarmuka pengguna yang responsif dan interaktif. React memastikan pengalaman yang cepat dan mulus dengan manajemen komponen yang efisien.

## Fitur Utama
1. __Autentikasi Pengguna__ : Pendaftaran dan login pengguna dengan validasi yang aman untuk melindungi data.
2. __Dashboard Pengguna__ : Setiap pengguna memiliki halaman profil dan dasbor untuk mengelola riwayat pembelian game, wishlist, dan pesanan.
3. __Sistem Keranjang Belanja__ : Pengguna dapat menambahkan game ke dalam keranjang belanja dan melihat total harga sebelum melakukan pembelian.
4. __Proses Pembayaran Aman__ : Mendukung berbagai metode pembayaran dengan keamanan terjamin untuk transaksi jual beli game.
5. __Wishlist Game__ : Pengguna dapat menyimpan game yang ingin dibeli di masa mendatang ke dalam wishlist.
6. __Pencarian dan Filter Game__ : Fitur pencarian dengan filter untuk membantu pengguna menemukan game yang sesuai dengan genre atau harga tertentu.
7. __Riwayat Pembelian dan Pengunduhan__ : Setiap pembelian game dicatat, dan pengguna dapat mengunduh ulang game yang sudah dibeli kapan saja dari halaman profil mereka.

## Instalasi dan Penggunaan
### Persiapan
Pastikan Anda sudah menginstal Node.js, MySQL, dan NPM di lingkungan Anda.
### Langkah-Langkah Instalasi
1. __Clone Repository__
   ```
   git clone https://github.com/username/game-x.git
   cd game-x
   ```
2. __Set Up BackEnd__
   - Pindah ke direktori `server_backend`:
   ```
   cd server_backend
   ```
