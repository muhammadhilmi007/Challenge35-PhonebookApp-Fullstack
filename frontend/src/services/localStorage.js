/**
 * LocalStorage Service Module
 * 
 * Provides utilities for managing contact data in localStorage.
 * Supports offline functionality and pending contacts management.
 */

// Storage Keys
const STORAGE_KEYS = {
  PENDING: 'pendingContacts',
  OFFLINE: 'offlineContacts'
};

/**
 * LocalStorage utility service
 * Handles all localStorage operations for contacts
 */
export const localStorageUtil = {
  /**
   * Retrieve all contacts from localStorage
   * 
   * @returns {Array} Array of contacts
   */
  getAllContacts: () => {
    const offlineContacts = localStorage.getItem(STORAGE_KEYS.OFFLINE);
    return offlineContacts ? JSON.parse(offlineContacts) : [];
  },

  /**
   * Save contacts to localStorage
   * Filters out pending contacts before saving
   * 
   * @param {Array} contacts - Array of contacts to save
   */
  saveAllContacts: (contacts) => {
    const pendingIds = localStorageUtil.getPendingContacts()
      .map(contact => contact.id);
    
    const filteredContacts = contacts.filter(contact => 
      !pendingIds.includes(contact.id)
    );
    
    localStorage.setItem(
      STORAGE_KEYS.OFFLINE, 
      JSON.stringify(filteredContacts)
    );
  },

  /**
   * Retrieve pending contacts
   * 
   * @returns {Array} Array of pending contacts
   */
  getPendingContacts: () => {
    const pendingContacts = localStorage.getItem(STORAGE_KEYS.PENDING);
    return pendingContacts ? JSON.parse(pendingContacts) : [];
  },

  /**
   * Add a new contact to pending list
   * 
   * @param {Object} contact - Contact to add to pending
   * @returns {Object} New contact with pending status
   */
  addPendingContact: (contact) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    
    // Create new contact with pending status
    const newContact = {
      ...contact,
      id: `pending_${Date.now()}`,
      status: 'pending'
    };
    
    // Add to beginning of pending contacts
    pendingContacts.unshift(newContact);
    localStorage.setItem(
      STORAGE_KEYS.PENDING, 
      JSON.stringify(pendingContacts)
    );
    
    return newContact;
  },

  /**
   * Remove a contact from pending list
   * 
   * @param {string} pendingId - ID of pending contact to remove
   */
  removePendingContact: (pendingId) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const updatedContacts = pendingContacts.filter(
      contact => contact.id !== pendingId
    );
    
    localStorage.setItem(
      STORAGE_KEYS.PENDING, 
      JSON.stringify(updatedContacts)
    );
  },

  /**
   * Clear all offline contacts from storage
   */
  clearOfflineContacts: () => {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE);
  },

  /**
   * Check server availability
   * 
   * @returns {Promise<boolean>} True if server is available
   */
  isServerAvailable: async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/api/phonebooks?page=1&limit=1'
      );
      return response.ok;
    } catch (error) {
      console.error('Server availability check failed:', error);
      return false;
    }
  }
};

/**
 * LocalStorage Module Documentation
 * 
 * This module provides utilities for managing contact data in localStorage,
 * enabling offline functionality and pending contact management.
 * 
 * Features:
 * - Offline contact storage
 * - Pending contact management
 * - Server availability checking
 * 
 * Storage Structure:
 * - Pending contacts: Stored with 'pending_' prefix and status
 * - Offline contacts: Regular contacts cached for offline use
 * 
 * Usage Example:
 * ```javascript
 * // Add pending contact
 * const pending = localStorageUtil.addPendingContact({ name: 'John' });
 * 
 * // Get all contacts
 * const contacts = localStorageUtil.getAllContacts();
 * ```
 */
