import axios from 'axios';
import Constants from 'expo-constants';

// Get the local IP for development
const LOCAL_IP = Constants.manifest.debuggerHost?.split(':')[0];
const BASE_URL = `http://${LOCAL_IP}:3001/api`;

export const api = {
  getContacts: async (page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search = '') => {
    const response = await axios.get(`${BASE_URL}/phonebooks`, {
      params: { page, limit, sortBy, sortOrder, name: search }
    });
    return response.data;
  },

  addContact: async (contact) => {
    const response = await axios.post(`${BASE_URL}/phonebooks`, contact);
    return response.data;
  },

  updateContact: async (id, contact) => {
    const response = await axios.put(`${BASE_URL}/phonebooks/${id}`, contact);
    return response.data;
  },

  deleteContact: async (id) => {
    const response = await axios.delete(`${BASE_URL}/phonebooks/${id}`);
    return response.data;
  },

  updateAvatar: async (id, formData) => {
    const response = await axios.put(
      `${BASE_URL}/phonebooks/${id}/avatar`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  }
};