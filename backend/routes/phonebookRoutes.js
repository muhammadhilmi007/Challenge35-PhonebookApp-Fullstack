// Modul express diimpor untuk membuat router
const express = require('express');
// Membuat instance router dari express
const router = express.Router();
// Mengimpor controller untuk phonebook dari file terpisah
const phonebookController = require('../controllers/phonebookController');
// Mengimpor middleware upload untuk menangani unggahan file
const upload = require('../middleware/upload');

// Mendefinisikan rute-rute API:

// GET /phonebooks: Mengambil semua kontak
router.get('/phonebooks', phonebookController.getContacts);

// POST /phonebooks: Menambahkan kontak baru
router.post('/phonebooks', phonebookController.addContact);

// PUT /phonebooks/:id: Memperbarui kontak berdasarkan ID
router.put('/phonebooks/:id', phonebookController.updateContact);

// DELETE /phonebooks/:id: Menghapus kontak berdasarkan ID
router.delete('/phonebooks/:id', phonebookController.deleteContact);

// PUT /phonebooks/:id/avatar: Memperbarui avatar kontak
// Menggunakan middleware upload.single('photo') untuk menangani unggahan file
router.put('/phonebooks/:id/avatar', upload.single('photo'), phonebookController.updateAvatar);

// GET /phonebooks/:id: Mengambil kontak berdasarkan ID
router.get('/phonebooks/:id', phonebookController.getContactById);

// Mengekspor router agar dapat digunakan di file lain
module.exports = router;

/*
Penjelasan, Alur, dan Logika:

1. Struktur Router:
   Router ini mendefinisikan endpoint-endpoint API untuk operasi CRUD pada entitas kontak dalam buku telepon.
   Setiap rute terhubung ke fungsi controller yang sesuai untuk memproses permintaan.

2. Alur Umum:
   a. Permintaan HTTP diterima dari frontend
   b. Router mengarahkan permintaan ke fungsi controller yang sesuai
   c. Controller memproses permintaan dan berinteraksi dengan model/database
   d. Hasil operasi dikirim kembali ke frontend sebagai respons

3. Logika per Rute:
   - GET /phonebooks: Mengambil daftar kontak, mendukung paginasi, pengurutan, dan pencarian
   - POST /phonebooks: Membuat kontak baru
   - PUT /phonebooks/:id: Memperbarui data kontak yang ada
   - DELETE /phonebooks/:id: Menghapus kontak
   - PUT /phonebooks/:id/avatar: Memperbarui foto profil kontak
   - GET /phonebooks/:id: Mengambil detail kontak tertentu

4. Middleware:
   Untuk rute avatar, middleware 'upload' digunakan untuk menangani unggahan file sebelum diproses oleh controller.

5. Keterhubungan dengan Frontend:
   a. Frontend mengirim permintaan HTTP ke endpoint yang sesuai.
   b. Contoh interaksi:
      - Saat aplikasi dimuat, frontend memanggil GET /phonebooks untuk menampilkan daftar kontak.
      - Ketika pengguna menambah kontak, frontend mengirim POST /phonebooks dengan data kontak baru.
      - Untuk mengedit kontak, frontend menggunakan PUT /phonebooks/:id dengan data yang diperbarui.
      - Saat menghapus kontak, frontend memanggil DELETE /phonebooks/:id.
      - Untuk mengganti foto profil, frontend mengirim PUT /phonebooks/:id/avatar dengan file gambar.
      - Ketika pengguna memilih kontak tertentu, frontend memanggil GET /phonebooks/:id untuk detail.

6. Keamanan dan Validasi:
   - Validasi data input sebaiknya dilakukan di frontend sebelum mengirim ke backend.
   - Controller harus melakukan validasi tambahan untuk memastikan integritas data.

7. Penanganan Error:
   - Controller bertanggung jawab untuk menangani error dan mengirim respons yang sesuai ke frontend.

Router ini berfungsi sebagai titik masuk untuk semua operasi terkait buku telepon, memastikan permintaan dari frontend diarahkan ke logika bisnis yang tepat di backend.
*/