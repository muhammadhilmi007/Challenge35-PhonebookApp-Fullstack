import axios from 'axios';
import { localStorageUtil } from '../utils/localStorage';

/**
 * Konfigurasi API
 */
const API_URL = 'http://52.220.170.56:3001/api';

/**
 * Memeriksa status server dengan timeout
 * @returns {Promise<boolean>} Status server (online/offline)
 */
const checkServerStatus = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await axios.get(`${API_URL}/phonebooks`, {
      params: { page: 1, limit: 1 },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('Server check timed out');
    }
    return false;
  }
};

/**
 * API Service untuk mengelola kontak
 * Menyediakan fungsi-fungsi untuk:
 * - Mengambil daftar kontak
 * - Menambah kontak baru
 * - Mengupdate kontak
 * - Menghapus kontak
 * - Mengupdate avatar
 * 
 * Mendukung mode offline dengan menyimpan data di localStorage
 */
export const api = {
  /**
   * Mengambil daftar kontak dari server atau localStorage
   * @param {number} page - Halaman yang diminta
   * @param {number} limit - Jumlah item per halaman
   * @param {string} sortBy - Field untuk pengurutan (name/phone)
   * @param {string} sortOrder - Urutan pengurutan (asc/desc)
   * @param {string} search - Kata kunci pencarian
   * @returns {Promise<Object>} Data kontak dan informasi pagination
   */
  getContacts: async (page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', search = '') => {
    try {
      const isOnline = await checkServerStatus();
      
      if (!isOnline) {
        console.log('Server offline, using local storage');
        return api.getOfflineContacts(search, sortBy, sortOrder);
      }

      // Jika online, ambil dari server dengan pagination
      const response = await axios.get(`${API_URL}/phonebooks`, {
        params: { 
          page, 
          limit: Math.min(limit, 100),
          sortBy, 
          sortOrder, 
          name: search 
        }
      });
      
      // Gabungkan kontak dari server dengan kontak pending
      const serverContacts = response.data.phonebooks || [];
      const pendingContacts = localStorageUtil.getPendingContacts();
      
      // Simpan kontak server ke localStorage
      api.syncServerContactsToLocal(serverContacts);
      
      // Gabungkan dan kembalikan hasil
      const combinedContacts = [...pendingContacts, ...serverContacts];
      return {
        data: combinedContacts,
        total: response.data.total + pendingContacts.length,
        page: response.data.page,
        totalPages: response.data.pages
      };
    } catch (error) {
      console.error('Gagal mengambil kontak:', error);
      return api.getOfflineContacts(search, sortBy, sortOrder);
    }
  },

  /**
   * Mendapatkan kontak dalam mode offline
   * @private
   */
  getOfflineContacts: (search, sortBy, sortOrder) => {
    const offlineContacts = localStorageUtil.getAllContacts();
    const pendingContacts = localStorageUtil.getPendingContacts();
    let allContacts = [...pendingContacts, ...offlineContacts];
    
    // Terapkan filter pencarian
    if (search) {
      allContacts = allContacts.filter(contact => 
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.phone.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Terapkan pengurutan
    allContacts.sort((a, b) => {
      const aValue = a[sortBy]?.toLowerCase() || '';
      const bValue = b[sortBy]?.toLowerCase() || '';
      return sortOrder === 'asc' ? 
        aValue.localeCompare(bValue) : 
        bValue.localeCompare(aValue);
    });

    return {
      data: allContacts,
      total: allContacts.length,
      page: 1,
      totalPages: 1
    };
  },

  /**
   * Sinkronisasi kontak server ke localStorage
   * @private
   */
  syncServerContactsToLocal: (serverContacts) => {
    const existingContacts = localStorageUtil.getAllContacts();
    const newServerContacts = serverContacts.filter(newContact => 
      !existingContacts.some(existingContact => existingContact.id === newContact.id)
    );
    localStorageUtil.saveAllContacts([...existingContacts, ...newServerContacts]);
  },

  /**
   * Menambah kontak baru
   * @param {Object} contact - Data kontak baru
   * @returns {Promise<Object>} Kontak yang berhasil ditambahkan
   */
  addContact: async (contact) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        console.log('Server offline, saving to local storage');
        return localStorageUtil.addPendingContact(contact);
      }

      const response = await axios.post(`${API_URL}/phonebooks`, contact);
      return response.data;
    } catch (error) {
      console.error('Gagal menambah kontak:', error);
      return localStorageUtil.addPendingContact(contact);
    }
  },

  /**
   * Mengirim ulang kontak yang pending
   * @param {Object} pendingContact - Kontak yang akan dikirim ulang
   * @returns {Promise<Object>} Hasil pengiriman ulang
   */
  resendContact: async (pendingContact) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        throw new Error('Server sedang tidak aktif. Silakan coba lagi nanti.');
      }

      const { id, status, ...contactData } = pendingContact;
      
      console.log('Mengirim ulang kontak ke server:', contactData);
      const response = await axios.post(`${API_URL}/phonebooks`, contactData);
      
      if (response.data) {
        console.log('Kontak berhasil dikirim ke server');
        localStorageUtil.removePendingContact(pendingContact.id);
        return response.data;
      }
    } catch (error) {
      console.error('Gagal mengirim ulang kontak:', error);
      throw error;
    }
  },

  /**
   * Memperbarui kontak yang ada
   * @param {string} id - ID kontak yang akan diperbarui
   * @param {Object} contact - Data kontak yang diperbarui
   * @returns {Promise<Object>} Kontak yang berhasil diperbarui
   */
  updateContact: async (id, contact) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        return localStorageUtil.addPendingContact(contact);
      }

      const response = await axios.put(`${API_URL}/phonebooks/${id}`, contact);
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui kontak:', error);
      return localStorageUtil.addPendingContact(contact);
    }
  },

  /**
   * Menghapus kontak
   * @param {string} id - ID kontak yang akan dihapus
   * @returns {Promise<Object>} Hasil penghapusan
   */
  deleteContact: async (id) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        return localStorageUtil.addPendingContact({ id, status: 'deleted' });
      }

      const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Gagal menghapus kontak:', error);
      return localStorageUtil.addPendingContact({ id, status: 'deleted' });
    }
  },

  /**
   * Memperbarui avatar kontak
   * @param {string} id - ID kontak
   * @param {FormData} formData - Data avatar baru
   * @returns {Promise<Object>} Hasil pembaruan avatar
   */
  updateAvatar: async (id, formData) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        return localStorageUtil.addPendingContact({ id, status: 'avatar-updated' });
      }

      const response = await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui avatar:', error);
      return localStorageUtil.addPendingContact({ id, status: 'avatar-updated' });
    }
  },

  /**
   * Mengambil detail kontak berdasarkan ID
   * @param {string} id - ID kontak
   * @returns {Promise<Object>} Detail kontak
   */
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
