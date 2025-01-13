/**
 * Constants for localStorage keys
 */
const PENDING_CONTACTS_KEY = 'pendingContacts';
const OFFLINE_CONTACTS_KEY = 'offlineContacts';

/**
 * Utility for managing contacts in localStorage
 */
export const localStorageUtil = {
  /**
   * Get all contacts from localStorage
   */
  getAllContacts: () => {
    const offlineContacts = localStorage.getItem(OFFLINE_CONTACTS_KEY);
    return offlineContacts ? JSON.parse(offlineContacts) : [];
  },

  /**
   * Save all contacts to localStorage
   */
  saveAllContacts: (contacts) => {
    // Don't save pending contacts to offline storage
    const pendingIds = localStorageUtil.getPendingContacts().map(c => c.id);
    const filteredContacts = contacts.filter(contact => !pendingIds.includes(contact.id));
    localStorage.setItem(OFFLINE_CONTACTS_KEY, JSON.stringify(filteredContacts));
  },

  /**
   * Get pending contacts
   */
  getPendingContacts: () => {
    const pendingContacts = localStorage.getItem(PENDING_CONTACTS_KEY);
    return pendingContacts ? JSON.parse(pendingContacts) : [];
  },

  /**
   * Add a contact to pending list
   */
  addPendingContact: (contact) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const newContact = {
      ...contact,
      id: `pending_${Date.now()}`,
      status: 'pending'
    };
    // Add to beginning of pending contacts
    pendingContacts.unshift(newContact);
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(pendingContacts));
    return newContact;
  },

  /**
   * Remove a contact from pending list
   */
  removePendingContact: (pendingId) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const updatedContacts = pendingContacts.filter(contact => contact.id !== pendingId);
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(updatedContacts));
  },

  /**
   * Clear all offline contacts
   */
  clearOfflineContacts: () => {
    localStorage.removeItem(OFFLINE_CONTACTS_KEY);
  },

  /**
   * Check if server is available by trying to fetch contacts
   */
  isServerAvailable: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/phonebooks?page=1&limit=1');
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
