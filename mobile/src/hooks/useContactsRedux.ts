import { useCallback } from 'react';
import { useDispatch as useDispatchBase, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { ContactData } from '../types';
import {
  fetchContacts,
  createContact,
  editContact,
  removeContact,
} from '../store/contacts/actions';

export const useContactsRedux = () => {
  const dispatch = useDispatchBase<any>();
  const { phonebooks, total, page, pages, loading, error } = useSelector(
    (state: RootState) => state.contacts
  );

  const handleFetchContacts = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'name',
      sortOrder: 'asc' | 'desc' = 'asc',
      search: string = ''
    ) => {
      try {
        await dispatch(fetchContacts(page, limit, sortBy, sortOrder, search));
        return true;
      } catch (error) {
        console.error('Error fetching contacts:', error);
        return false;
      }
    },
    [dispatch]
  );

  const handleCreateContact = useCallback(
    async (contactData: ContactData) => {
      try {
        const result = await dispatch(createContact(contactData));
        return result;
      } catch (error) {
        console.error('Error creating contact:', error);
        return false;
      }
    },
    [dispatch]
  );

  const handleEditContact = useCallback(
    async (id: number, contactData: ContactData) => {
      try {
        const result = await dispatch(editContact(id, contactData));
        return result;
      } catch (error) {
        console.error('Error editing contact:', error);
        return false;
      }
    },
    [dispatch]
  );

  const handleRemoveContact = useCallback(
    async (id: number) => {
      try {
        const result = await dispatch(removeContact(id));
        return result;
      } catch (error) {
        console.error('Error removing contact:', error);
        return false;
      }
    },
    [dispatch]
  );

  return {
    contacts: {
      phonebooks,
      total,
      page,
      pages,
    },
    loading,
    error,
    fetchContacts: handleFetchContacts,
    createContact: handleCreateContact,
    editContact: handleEditContact,
    removeContact: handleRemoveContact,
  };
};
