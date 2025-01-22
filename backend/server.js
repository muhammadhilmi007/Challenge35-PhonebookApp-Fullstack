// Import modul-modul yang diperlukan
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const phonebookRoutes = require('./routes/phonebookRoutes');
const apiContact = require('./routes/apiContact');

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi middleware
app.use(cors()); // Mengaktifkan CORS untuk permintaan lintas domain
app.use(express.json()); // Mengaktifkan parsing JSON untuk body request
app.use('/uploads', express.static('uploads')); // Menyajikan file statis dari folder 'uploads'

// Konfigurasi rute API
app.use('/api', phonebookRoutes); // Mengarahkan rute '/api' ke phonebookRoutes
app.use('/api', apiContact); // Mengarahkan rute '/api' ke apiContact

// Tentukan port server
const PORT = process.env.PORT || 3001;

// Sinkronisasi database dan menjalankan server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
  });
});

// Ekspor aplikasi untuk penggunaan di file lain
module.exports = app;

/*
Penjelasan, Alur, dan Logika:

1. Struktur Aplikasi:
   - Aplikasi ini menggunakan Express.js sebagai framework web untuk Node.js.
   - Sequelize digunakan sebagai ORM untuk berinteraksi dengan database.
   - Rute API didefinisikan dalam file terpisah (phonebookRoutes dan apiContact).

2. Alur Eksekusi:
   a. Modul-modul penting diimpor.
   b. Aplikasi Express diinisialisasi.
   c. Middleware dikonfigurasi (CORS, JSON parsing, file statis).
   d. Rute API didefinisikan.
   e. Port server ditentukan.
   f. Database disinkronkan.
   g. Server dijalankan.
   h. Aplikasi diekspor untuk penggunaan di file lain.

3. Logika Utama:
   - CORS diaktifkan untuk memungkinkan permintaan dari domain yang berbeda.
   - JSON parsing memungkinkan server memproses data JSON dari permintaan.
   - File statis (seperti gambar profil) disajikan dari folder 'uploads'.
   - Rute API dipisahkan ke dalam modul terpisah untuk organisasi kode yang lebih baik.
   - Server berjalan pada port yang ditentukan oleh variabel lingkungan atau default 3001.

4. Keterhubungan dengan Frontend:
   a. Frontend dapat mengirim permintaan HTTP ke endpoint yang didefinisikan di phonebookRoutes dan apiContact.
   b. CORS memungkinkan frontend dari domain yang berbeda untuk mengakses API.
   c. Frontend dapat mengirim dan menerima data dalam format JSON.
   d. File statis seperti gambar profil dapat diakses langsung oleh frontend melalui URL '/uploads/'.
   e. Frontend harus dikonfigurasi untuk mengirim permintaan ke URL yang sesuai (misalnya 'http://localhost:3001/api/...').
   f. Respon dari server akan diterima oleh frontend dan dapat digunakan untuk memperbarui antarmuka pengguna.

5. Keamanan dan Optimisasi:
   - CORS harus dikonfigurasi dengan benar untuk mencegah akses yang tidak sah.
   - Penggunaan Sequelize membantu mencegah serangan injeksi SQL.
   - File statis disajikan secara efisien menggunakan middleware Express.

6. Skalabilitas:
   - Struktur modular memungkinkan penambahan fitur baru dengan mudah.
   - Penggunaan ORM memudahkan migrasi atau perubahan skema database di masa depan.

Server ini bertindak sebagai backend yang menyediakan API untuk aplikasi buku telepon, memungkinkan frontend untuk melakukan operasi CRUD pada data kontak.
*/