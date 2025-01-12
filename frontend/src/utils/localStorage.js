const PENDING_CONTACTS_KEY = 'pendingContacts';
const OFFLINE_CONTACTS_KEY = 'offlineContacts';

export const localStorageUtil = {
  // Get all contacts from local storage
  getAllContacts: () => {
    const offlineContacts = localStorage.getItem(OFFLINE_CONTACTS_KEY);
    return offlineContacts ? JSON.parse(offlineContacts) : [];
  },

  // Save all contacts to local storage when offline
  saveAllContacts: (contacts) => {
    localStorage.setItem(OFFLINE_CONTACTS_KEY, JSON.stringify(contacts));
  },

  // Get pending contacts from local storage
  getPendingContacts: () => {
    const pendingContacts = localStorage.getItem(PENDING_CONTACTS_KEY);
    return pendingContacts ? JSON.parse(pendingContacts) : [];
  },

  // Add a pending contact to local storage
  addPendingContact: (contact) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const newContact = {
      ...contact,
      id: `pending_${Date.now()}`, // Temporary ID for pending contacts
      status: 'pending'
    };
    pendingContacts.unshift(newContact); // Add to beginning of array
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(pendingContacts));
    return newContact;
  },

  // Remove a pending contact from local storage
  removePendingContact: (pendingId) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const updatedContacts = pendingContacts.filter(contact => contact.id !== pendingId);
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(updatedContacts));
  },

  // Clear all offline contacts
  clearOfflineContacts: () => {
    localStorage.removeItem(OFFLINE_CONTACTS_KEY);
  }
};
