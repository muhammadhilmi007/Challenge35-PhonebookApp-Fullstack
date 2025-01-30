import { Contact } from '../types';

type SortOrder = 'asc' | 'desc';

const contactHelpers = {
  sortContacts: (contacts: Contact[], sortOrder: SortOrder = 'asc'): Contact[] => {
    return [...contacts].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  },

  deduplicateContacts: (contacts: Contact[], sortOrder: SortOrder = 'asc'): Contact[] => {
    const seen = new Map<string, Contact>();
    
    // Process contacts in reverse to keep the newest version
    for (let i = contacts.length - 1; i >= 0; i--) {
      const contact = contacts[i];
      if (!seen.has(contact.id)) {
        seen.set(contact.id, contact);
      }
    }
    
    const uniqueContacts = Array.from(seen.values());
    return contactHelpers.sortContacts(uniqueContacts, sortOrder);
  }
};

export default contactHelpers;
