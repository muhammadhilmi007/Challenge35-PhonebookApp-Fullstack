import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getContacts, addContact, updateContact, deleteContact } from '../services/api';
import { Contact, ContactData, ContactsResponse } from '../types';

interface ContactsState extends ContactsResponse {}

export const useContacts = () => {
  const [contacts, setContacts] = useState<ContactsState>({ 
    phonebooks: [], 
    total: 0, 
    page: 1, 
    pages: 1 
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (
    page: number = 1, 
    limit: number = 10, 
    sortBy: string = 'name', 
    sortOrder: 'asc' | 'desc' = 'asc', 
    search: string = ''
  ): Promise<void> => {
    setLoading(true);
    try {
      const response = await getContacts(page, limit, sortBy, sortOrder, search);
      
      // If it's the first page or a search, replace the contacts
      if (page === 1) {
        setContacts(response);
      } else {
        // For subsequent pages, append to existing contacts
        setContacts(prev => ({
          ...response,
          phonebooks: [...prev.phonebooks, ...response.phonebooks]
        }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error in fetchContacts:', err);
      setError('Failed to fetch contacts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (contactData: ContactData): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await addContact(contactData);
      if (response) {
        await fetchContacts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error in createContact:', err);
      Alert.alert('Error', 'Failed to create contact');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchContacts]);

  const editContact = useCallback(async (id: number, contactData: ContactData): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await updateContact(id, contactData);
      if (response) {
        setContacts(prev => ({
          ...prev,
          phonebooks: prev.phonebooks.map(contact => 
            contact.id === id ? { ...contact, ...response } : contact
          )
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error in editContact:', err);
      Alert.alert('Error', 'Failed to update contact');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeContact = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await deleteContact(id);
      if (response) {
        // Optimistically update the UI
        setContacts(prev => {
          const updatedPhonebooks = prev.phonebooks.filter(contact => contact.id !== id);
          return {
            ...prev,
            phonebooks: updatedPhonebooks,
            total: prev.total - 1
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error in removeContact:', err);
      Alert.alert('Error', 'Failed to delete contact. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    editContact,
    removeContact,
  };
};

// Export types for use in other files
export type { Contact, ContactData };
