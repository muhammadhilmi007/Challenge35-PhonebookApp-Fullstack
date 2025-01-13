/**
 * API Service Module
 * 
 * Provides a centralized interface for all API interactions.
 * Uses axios for HTTP requests and includes error handling.
 */

import axios from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  ENDPOINTS: {
    CONTACTS: '/phonebooks',
    AVATAR: '/avatar'
  }
};

/**
 * API service object containing all API interaction methods
 */
export const api = {
  /**
   * Fetch contacts with pagination, sorting, and search
   * 
   * @param {number} page - Current page number
   * @param {number} limit - Number of items per page
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort direction ('asc' or 'desc')
   * @param {string} search - Search query
   * @returns {Promise<Object>} Paginated contacts data
   */
  getContacts: async (
    page = 1, 
    limit = 5, 
    sortBy = 'name', 
    sortOrder = 'asc', 
    search = ''
  ) => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACTS}`, {
        params: { page, limit, sortBy, sortOrder, name: search }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      throw error;
    }
  },

  /**
   * Create a new contact
   * 
   * @param {Object} contact - Contact data to create
   * @returns {Promise<Object>} Created contact data
   */
  addContact: async (contact) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACTS}`, 
        contact
      );
      return response.data;
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  },

  /**
   * Update an existing contact
   * 
   * @param {string|number} id - Contact ID
   * @param {Object} contact - Updated contact data
   * @returns {Promise<Object>} Updated contact data
   */
  updateContact: async (id, contact) => {
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACTS}/${id}`, 
        contact
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  },

  /**
   * Delete a contact
   * 
   * @param {string|number} id - Contact ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteContact: async (id) => {
    try {
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACTS}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  },

  /**
   * Update contact's avatar
   * 
   * @param {string|number} id - Contact ID
   * @param {FormData} formData - Form data containing the avatar file
   * @returns {Promise<Object>} Updated contact data with new avatar
   */
  updateAvatar: async (id, formData) => {
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACTS}/${id}${API_CONFIG.ENDPOINTS.AVATAR}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  },

  /**
   * Fetch a single contact by ID
   * 
   * @param {string|number} id - Contact ID to fetch
   * @returns {Promise<Object>} Contact data
   */
  getContactById: async (id) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACTS}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contact details:', error);
      throw error;
    }
  }
};

/**
 * API Module Documentation
 * 
 * This module provides a centralized interface for all API interactions using axios.
 * 
 * Features:
 * - Pagination support for contact listing
 * - Sorting and searching capabilities
 * - CRUD operations for contacts
 * - Avatar upload handling
 * 
 * Error Handling:
 * - All methods include try-catch blocks
 * - Errors are logged to console and re-thrown
 * - Consistent error message format
 * 
 * Usage Example:
 * ```javascript
 * // Fetch contacts with pagination
 * const contacts = await api.getContacts(1, 10, 'name', 'asc', 'search');
 * 
 * // Add a new contact
 * const newContact = await api.addContact({ name: 'John', phone: '123' });
 * ```
 */