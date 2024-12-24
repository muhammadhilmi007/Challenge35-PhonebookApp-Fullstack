// Impor modul-modul yang diperlukan
const Phonebook = require('../models/phonebook');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Definisikan objek controller untuk menangani operasi-operasi terkait buku telepon
const phonebookController = {
  // Mendapatkan semua kontak dengan paginasi, pengurutan, dan pencarian
  getContacts: async (req, res) => {
    try {
      // Ekstrak parameter query dengan nilai default
      const { page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', name = '' } = req.query;
      const offset = (page - 1) * limit;

      // Buat kondisi pencarian untuk nama atau nomor telepon
      const searchCondition = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${name}%` } },
          { phone: { [Op.iLike]: `%${name}%` } }
        ]
      };

      // Lakukan pencarian dengan paginasi dan pengurutan
      const { count, rows } = await Phonebook.findAndCountAll({
        where: searchCondition,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Kirim respons JSON dengan hasil pencarian dan informasi paginasi
      res.json({
        phonebooks: rows,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        total: count
      });
    } catch (error) {
      // Tangani kesalahan dan kirim respons error
      res.status(500).json({ error: error.message });
    }
  },

  // Menambahkan kontak baru
  addContact: async (req, res) => {
    try {
      // Ekstrak data dari body request
      const { name, phone } = req.body;
      // Buat kontak baru di database
      const contact = await Phonebook.create({ name, phone });
      // Kirim respons sukses dengan data kontak yang baru dibuat
      res.status(201).json(contact);
    } catch (error) {
      // Tangani kesalahan dan kirim respons error
      res.status(400).json({ error: error.message });
    }
  },

  // Memperbarui kontak yang ada
  updateContact: async (req, res) => {
    try {
      // Dapatkan ID kontak dari parameter URL
      const { id } = req.params;
      // Ekstrak data baru dari body request
      const { name, phone } = req.body;
      // Cari kontak berdasarkan ID
      const contact = await Phonebook.findByPk(id);
      
      // Jika kontak tidak ditemukan, kirim respons error
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Perbarui kontak dengan data baru
      await contact.update({ name, phone });
      // Kirim respons sukses dengan data kontak yang diperbarui
      res.status(201).json(contact);
    } catch (error) {
      // Tangani kesalahan dan kirim respons error
      res.status(400).json({ error: error.message });
    }
  },

  // Menghapus kontak
  deleteContact: async (req, res) => {
    try {
      // Dapatkan ID kontak dari parameter URL
      const { id } = req.params;
      // Cari kontak berdasarkan ID
      const contact = await Phonebook.findByPk(id);
      
      // Jika kontak tidak ditemukan, kirim respons error
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Hapus kontak dari database
      await contact.destroy();
      // Kirim respons sukses
      res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      // Tangani kesalahan dan kirim respons error
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mendapatkan kontak berdasarkan ID
  getContactById: async (req, res) => {
    try {
      // Dapatkan ID kontak dari parameter URL
      const { id } = req.params;
      // Cari kontak berdasarkan ID
      const contact = await Phonebook.findByPk(id);
      
      // Jika kontak tidak ditemukan, kirim respons error
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Kirim respons dengan data kontak
      res.json(contact);
    } catch (error) {
      // Tangani kesalahan dan kirim respons error
      res.status(500).json({ error: error.message });
    }
  },

  // Memperbarui avatar kontak
  updateAvatar: async (req, res) => {
    try {
      // Dapatkan ID kontak dari parameter URL
      const { id } = req.params;
      // Cari kontak berdasarkan ID
      const contact = await Phonebook.findByPk(id);
      
      // Jika kontak tidak ditemukan, kirim respons error
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Hapus file avatar lama jika ada dan bukan avatar default
      if (contact.photo && contact.photo !== '/user-avatar.svg') {
        const oldAvatarPath = path.join(__dirname, '..', 'uploads', path.basename(contact.photo));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Perbarui dengan avatar baru jika ada file yang diunggah, jika tidak gunakan foto yang ada
      const photo = req.file ? `/uploads/${req.file.filename}` : contact.photo;
      // Perbarui data kontak dengan foto baru
      await contact.update({ photo });
      // Kirim respons sukses dengan data kontak yang diperbarui
      res.status(201).json(contact);
    } catch (error) {
      // Tangani kesalahan dan kirim respons error
      res.status(400).json({ error: error.message });
    }
  }
};

// Ekspor objek controller agar dapat digunakan di file lain
module.exports = phonebookController;