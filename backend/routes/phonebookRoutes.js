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

// Alur logika:
// 1. Modul dan dependensi diimpor
// 2. Router Express dibuat
// 3. Rute-rute API didefinisikan, masing-masing terhubung ke fungsi controller yang sesuai
// 4. Untuk rute avatar, middleware upload digunakan sebelum controller
// 5. Router diekspor untuk digunakan dalam aplikasi utama