import { Contact } from '../types';

type SortOrder = 'asc' | 'desc';

const sortContacts = (contacts: Contact[], sortOrder: SortOrder = 'asc'): Contact[] =>
  [...contacts].sort((a, b) => {
    const compareResult = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    return sortOrder === 'asc' ? compareResult : -compareResult;
  });

const deduplicateContacts = (contacts: Contact[], sortOrder: SortOrder = 'asc'): Contact[] => {
  const uniqueContacts = Array.from(
    contacts.reduceRight((map, contact) => map.set(contact.id, contact), new Map<string, Contact>()).values()
  );
  return sortContacts(uniqueContacts, sortOrder);
};

export default { sortContacts, deduplicateContacts };
