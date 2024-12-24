import axios from 'axios';

// URL dasar API
const API_URL = 'http://localhost:3001/api';

// Objek api untuk interaksi dengan backend
export const api = {
  // Mengambil daftar kontak
  getContacts: async (page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', search = '') => {
    try {
      const response = await axios.get(`${API_URL}/phonebooks`, {
        params: { page, limit, sortBy, sortOrder, name: search }
      });
      console.log('Respon API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil kontak:', error);
      throw error;
    }
  },

  // Menambah kontak baru
  addContact: async (contact) => {
    try {
      const response = await axios.post(`${API_URL}/phonebooks`, contact);
      return response.data;
    } catch (error) {
      console.error('Gagal menambah kontak:', error);
      throw error;
    }
  },

  // Memperbarui kontak
  updateContact: async (id, contact) => {
    try {
      const response = await axios.put(`${API_URL}/phonebooks/${id}`, contact);
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui kontak:', error);
      throw error;
    }
  },

  // Menghapus kontak
  deleteContact: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Gagal menghapus kontak:', error);
      throw error;
    }
  },

  // Memperbarui avatar kontak
  updateAvatar: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui avatar:', error);
      throw error;
    }
  },

  // Mengambil detail kontak berdasarkan ID
  getContactById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil detail kontak:', error);
      throw error;
    }
  }
};

/*
Penjelasan:
Modul ini menyediakan antarmuka untuk berinteraksi dengan backend API menggunakan axios.

Alur dan Logika:
1. Impor axios untuk melakukan permintaan HTTP.
2. Tentukan URL dasar API.
3. Buat objek 'api' dengan metode-metode untuk operasi CRUD:
   - getContacts: Mengambil daftar kontak dengan opsi paginasi, pengurutan, dan pencarian.
   - addContact: Menambahkan kontak baru.
   - updateContact: Memperbarui kontak yang ada.
   - deleteContact: Menghapus kontak.
   - updateAvatar: Memperbarui avatar kontak.
   - getContactById: Mengambil detail kontak berdasarkan ID.
4. Setiap metode menggunakan axios untuk mengirim permintaan ke endpoint yang sesuai.
5. Penanganan kesalahan dilakukan dengan try-catch, mencatat error ke konsol dan melemparnya kembali.
6. Data respons dari API dikembalikan jika permintaan berhasil.

Keterhubungan dengan Backend:
- Setiap metode dalam objek 'api' berkorespondensi dengan endpoint tertentu di backend.
- Data dikirim dan diterima dalam format JSON.
- Permintaan GET menggunakan parameter query untuk paginasi, pengurutan, dan pencarian.
- Permintaan POST dan PUT mengirim data kontak ke backend untuk disimpan atau diperbarui.
- Permintaan DELETE mengirim ID kontak yang akan dihapus.
- Untuk pembaruan avatar, digunakan Content-Type multipart/form-data.
- Semua interaksi dengan backend dilakukan secara asynchronous menggunakan async/await.
*/