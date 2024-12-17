import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = {
  getContacts: async (page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', search = '') => {
    try {
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

  addContact: async (contact) => {
    try {
      const response = await axios.post(`${API_URL}/phonebooks`, contact);
      return response.data;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  updateContact: async (id, contact) => {
    try {
      const response = await axios.put(`${API_URL}/phonebooks/${id}`, contact);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  updateAvatar: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  getContactById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/phonebooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }
};