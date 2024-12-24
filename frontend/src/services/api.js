import axios from 'axios';

// Mendefinisikan URL dasar API
const API_URL = 'http://localhost:3001/api';

// Mengekspor objek api yang berisi fungsi-fungsi untuk berinteraksi dengan API
export const api = {
  // Fungsi untuk mendapatkan daftar kontak
  getContacts: async (page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', search = '') => {
    try {
      // Melakukan permintaan GET ke endpoint /phonebooks dengan parameter query
      const response = await axios.get(`${API_URL}/phonebooks`, {
        params: { page, limit, sortBy, sortOrder, name: search }
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  // Fungsi untuk menambahkan kontak baru
  addContact: async (contact) => {
    try {
      // Melakukan permintaan POST ke endpoint /phonebooks dengan data kontak
      const response = await axios.post(`${API_URL}/phonebooks`, contact);
      return response.data;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  // Fungsi untuk memperbarui kontak yang ada
  updateContact: async (id, contact) => {
    try {
      // Melakukan permintaan PUT ke endpoint /phonebooks/:id dengan data kontak yang diperbarui
      const response = await axios.put(`${API_URL}/phonebooks/${id}`, contact);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  // Fungsi untuk menghapus kontak
  deleteContact: async (id) => {
    try {
      // Melakukan permintaan DELETE ke endpoint /phonebooks/:id
      const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  // Fungsi untuk memperbarui avatar kontak
  updateAvatar: async (id, formData) => {
    try {
      // Melakukan permintaan PUT ke endpoint /phonebooks/:id/avatar dengan data form
      const response = await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  // Fungsi untuk mendapatkan detail kontak berdasarkan ID
  getContactById: async (id) => {
    try {
      // Melakukan permintaan GET ke endpoint /phonebooks/:id
      const response = await axios.get(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }
};

// Alur logika:
// 1. Modul axios diimpor untuk melakukan permintaan HTTP.
// 2. URL dasar API didefinisikan.
// 3. Objek api diekspor dengan berbagai metode untuk operasi CRUD:
//    - getContacts: Mengambil daftar kontak dengan opsi paginasi, pengurutan, dan pencarian.
//    - addContact: Menambahkan kontak baru.
//    - updateContact: Memperbarui kontak yang ada.
//    - deleteContact: Menghapus kontak.
//    - updateAvatar: Memperbarui avatar kontak.
//    - getContactById: Mengambil detail kontak berdasarkan ID.
// 4. Setiap metode menggunakan axios untuk melakukan permintaan ke endpoint yang sesuai.
// 5. Penanganan kesalahan dilakukan dengan blok try-catch, mencatat error ke konsol dan melemparnya kembali.
// 6. Data respons dari API dikembalikan jika permintaan berhasil.