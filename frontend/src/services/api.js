import axios from 'axios';
import { localStorageUtil } from '../utils/localStorage';

// URL dasar API
const API_URL = 'http://localhost:3001/api';

// Check if server is online with timeout
const checkServerStatus = async () => {
  try {
    // Set a timeout of 5 seconds for the health check
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

// Objek api untuk interaksi dengan backend
export const api = {
  // Mengambil daftar kontak
  getContacts: async (page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', search = '') => {
    try {
      const isOnline = await checkServerStatus();
      
      if (!isOnline) {
        console.log('Server offline, using local storage');
        // Get all contacts from local storage
        const offlineContacts = localStorageUtil.getAllContacts();
        const pendingContacts = localStorageUtil.getPendingContacts();
        
        // Combine and sort contacts
        let allContacts = [...pendingContacts, ...offlineContacts];
        
        // Apply search filter if needed
        if (search) {
          allContacts = allContacts.filter(contact => 
            contact.name.toLowerCase().includes(search.toLowerCase()) ||
            contact.phone.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Apply sorting
        allContacts.sort((a, b) => {
          const aValue = a[sortBy]?.toLowerCase() || '';
          const bValue = b[sortBy]?.toLowerCase() || '';
          return sortOrder === 'asc' ? 
            aValue.localeCompare(bValue) : 
            bValue.localeCompare(aValue);
        });

        // Return all contacts without pagination in offline mode
        return {
          data: allContacts,
          total: allContacts.length,
          page: 1,
          totalPages: 1
        };
      }

      // If online, get from server with pagination
      const response = await axios.get(`${API_URL}/phonebooks`, {
        params: { 
          page, 
          limit: Math.min(limit, 100), // Ensure we don't request too many at once
          sortBy, 
          sortOrder, 
          name: search 
        }
      });
      
      const serverContacts = response.data.phonebooks || [];
      const pendingContacts = localStorageUtil.getPendingContacts();
      
      // Save all server contacts to local storage
      const existingContacts = localStorageUtil.getAllContacts();
      const newServerContacts = serverContacts.filter(newContact => 
        !existingContacts.some(existingContact => existingContact.id === newContact.id)
      );
      localStorageUtil.saveAllContacts([...existingContacts, ...newServerContacts]);
      
      // Combine pending and server contacts
      const combinedContacts = [...pendingContacts, ...serverContacts];
      
      return {
        data: combinedContacts,
        total: response.data.total + pendingContacts.length,
        page: response.data.page,
        totalPages: response.data.pages
      };
    } catch (error) {
      console.error('Gagal mengambil kontak:', error);
      // If error, return all contacts from local storage
      const offlineContacts = localStorageUtil.getAllContacts();
      const pendingContacts = localStorageUtil.getPendingContacts();
      const allContacts = [...pendingContacts, ...offlineContacts];
      
      return {
        data: allContacts,
        total: allContacts.length,
        page: 1,
        totalPages: 1
      };
    }
  },

  // Menambah kontak baru
  addContact: async (contact) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        console.log('Server offline, saving to local storage');
        const pendingContact = localStorageUtil.addPendingContact(contact);
        return pendingContact;
      }

      const response = await axios.post(`${API_URL}/phonebooks`, contact);
      return response.data;
    } catch (error) {
      console.error('Gagal menambah kontak:', error);
      // Save to local storage if request fails
      const pendingContact = localStorageUtil.addPendingContact(contact);
      return pendingContact;
    }
  },

  // Resend pending contact
  resendContact: async (pendingContact) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        throw new Error('Server sedang tidak aktif. Silakan coba lagi nanti.');
      }

      // Remove pending ID and status before sending to server
      const { id, status, ...contactData } = pendingContact;
      
      console.log('Mengirim ulang kontak ke server:', contactData);
      const response = await axios.post(`${API_URL}/phonebooks`, contactData);
      
      if (response.data) {
        console.log('Kontak berhasil dikirim ke server');
        // Remove from local storage after successful send
        localStorageUtil.removePendingContact(pendingContact.id);
        return response.data;
      }
    } catch (error) {
      console.error('Gagal mengirim ulang kontak:', error);
      throw error;
    }
  },

  // Memperbarui kontak
  updateContact: async (id, contact) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        // Save to local storage if offline
        const pendingContact = localStorageUtil.addPendingContact(contact);
        return pendingContact;
      }

      const response = await axios.put(`${API_URL}/phonebooks/${id}`, contact);
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui kontak:', error);
      // Save to local storage if request fails
      const pendingContact = localStorageUtil.addPendingContact(contact);
      return pendingContact;
    }
  },

  // Menghapus kontak
  deleteContact: async (id) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        // Save to local storage if offline
        const pendingContact = localStorageUtil.addPendingContact({ id, status: 'deleted' });
        return pendingContact;
      }

      const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Gagal menghapus kontak:', error);
      // Save to local storage if request fails
      const pendingContact = localStorageUtil.addPendingContact({ id, status: 'deleted' });
      return pendingContact;
    }
  },

  // Memperbarui avatar kontak
  updateAvatar: async (id, formData) => {
    try {
      const isOnline = await checkServerStatus();
      if (!isOnline) {
        // Save to local storage if offline
        const pendingContact = localStorageUtil.addPendingContact({ id, status: 'avatar-updated' });
        return pendingContact;
      }

      const response = await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Gagal memperbarui avatar:', error);
      // Save to local storage if request fails
      const pendingContact = localStorageUtil.addPendingContact({ id, status: 'avatar-updated' });
      return pendingContact;
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
