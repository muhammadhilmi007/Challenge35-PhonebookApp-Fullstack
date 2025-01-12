const PENDING_CONTACTS_KEY = 'pendingContacts';

export const localStorageUtil = {
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
    pendingContacts.push(newContact);
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(pendingContacts));
    return newContact;
  },

  // Remove a pending contact from local storage
  removePendingContact: (pendingId) => {
    const pendingContacts = localStorageUtil.getPendingContacts();
    const updatedContacts = pendingContacts.filter(contact => contact.id !== pendingId);
    localStorage.setItem(PENDING_CONTACTS_KEY, JSON.stringify(updatedContacts));
  }
};
