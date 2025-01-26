import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchContacts, removeContact, resendContact, updateContact, addContact } from '../store/contactsSlice';
import { Contact } from '../types';

type SortOrder = 'asc' | 'desc';

interface UseContactsReturn {
  contacts: {
    phonebooks: Contact[];
    total: number;
    page: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  fetchContacts: (page?: number, limit?: number, sortBy?: string, sortOrder?: SortOrder, search?: string) => Promise<void>;
  handleDeleteContact: (id: string) => Promise<boolean>;
  handleResendContact: (contact: Contact) => Promise<boolean>;
  handleUpdateContact: (id: string, contact: Partial<Contact>) => Promise<boolean>;
  handleAddContact: (contact: Omit<Contact, 'id'>) => Promise<boolean>;
  isOffline: boolean;
}

export const useContacts = (): UseContactsReturn => {
  const dispatch = useAppDispatch();
  const { phonebooks, total, page, pages, loading, error, isOffline } = useAppSelector(state => state.contacts);

  const handleFetchContacts = useCallback(async (
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortOrder: SortOrder = 'asc',
    search: string = ''
  ): Promise<void> => {
    try {
      await dispatch(fetchContacts({ page, limit, sortBy, sortOrder, search })).unwrap();
    } catch (err) {
      console.error('Error in fetchContacts:', err);
    }
  }, [dispatch]);

  const handleDeleteContact = useCallback(async (id: string): Promise<boolean> => {
    try {
      await dispatch(removeContact(id)).unwrap();
      return true;
    } catch (err) {
      console.error('Error in handleDeleteContact:', err);
      Alert.alert('Error', 'Failed to delete contact');
      return false;
    }
  }, [dispatch]);

  const handleResendContact = useCallback(async (contact: Contact): Promise<boolean> => {
    try {
      await dispatch(resendContact(contact)).unwrap();
      Alert.alert('Success', 'Contact has been resent successfully');
      return true;
    } catch (err) {
      console.error('Error in handleResendContact:', err);
      Alert.alert('Error', 'Failed to resend contact');
      return false;
    }
  }, [dispatch]);

  const handleUpdateContact = useCallback(async (id: string, contact: Partial<Contact>): Promise<boolean> => {
    try {
      await dispatch(updateContact({ id, contact })).unwrap();
      return true;
    } catch (err) {
      console.error('Error in handleUpdateContact:', err);
      Alert.alert('Error', 'Failed to update contact');
      return false;
    }
  }, [dispatch]);

  const handleAddContact = useCallback(async (contact: Omit<Contact, 'id'>): Promise<boolean> => {
    try {
      const result = await dispatch(addContact(contact)).unwrap();
      if (result.isOffline) {
        Alert.alert('Offline Mode', 'Contact saved locally and will be synced when online');
      }
      return result.success;
    } catch (err) {
      console.error('Error in handleAddContact:', err);
      Alert.alert('Error', 'Failed to add contact');
      return false;
    }
  }, [dispatch]);

  return {
    contacts: {
      phonebooks,
      total,
      page,
      pages
    },
    loading,
    error,
    isOffline,
    fetchContacts: handleFetchContacts,
    handleDeleteContact,
    handleResendContact,
    handleUpdateContact,
    handleAddContact,
  };
};
