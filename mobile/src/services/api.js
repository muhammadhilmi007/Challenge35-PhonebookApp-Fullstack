import axios from 'axios';

const API_URL = 'http://192.168.1.9:3001/api'; // Using local IP address for mobile access

export const getContacts = async (page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search = '') => {
  try {
    const response = await axios.get(`${API_URL}/phonebooks`, {
      params: { page, limit, sortBy, sortOrder, name: search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const addContact = async (contact) => {
  try {
    // First create contact without avatar
    const response = await axios.post(`${API_URL}/phonebooks`, {
      name: contact.name,
      phone: contact.phone,
    });

    // If contact has an avatar, update it separately
    if (contact.avatar && response.data.id) {
      const formData = new FormData();
      
      // Get the filename from the URI
      const filename = contact.avatar.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('photo', {
        uri: contact.avatar,
        name: filename,
        type,
      });

      await axios.put(`${API_URL}/phonebooks/${response.data.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          return formData;
        },
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const updateContact = async (id, contact) => {
  try {
    // First update contact details
    const response = await axios.put(`${API_URL}/phonebooks/${id}`, {
      name: contact.name,
      phone: contact.phone,
    });

    // If contact has a new avatar (not a URL), update it separately
    if (contact.avatar && !contact.avatar.startsWith('http')) {
      const formData = new FormData();
      
      // Get the filename from the URI
      const filename = contact.avatar.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('photo', {
        uri: contact.avatar,
        name: filename,
        type,
      });

      await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          return formData;
        },
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting contact:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to delete contact');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up the request');
    }
  }
};