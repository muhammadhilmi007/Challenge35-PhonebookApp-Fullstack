// Import modul-modul yang diperlukan
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database.config');
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

// Penjelasan alur logika:
// 1. Impor modul yang diperlukan
// 2. Inisialisasi aplikasi Express
// 3. Konfigurasi middleware (CORS, JSON parsing, file statis)
// 4. Konfigurasi rute API
// 5. Tentukan port server
// 6. Sinkronisasi database dan jalankan server
// 7. Ekspor aplikasi