/**
 * Contact Context Provider
 * 
 * Manages the global state for contacts with features:
 * - Contact loading and pagination
 * - Search and sort functionality
 * - Offline support
 * - Contact CRUD operations
 */

import React, { createContext, useContext, useReducer } from 'react';
import { contactReducer, ACTIONS } from '../hooks/Reducer';
import { api } from '../services/api';
import { localStorageUtil } from '../services/localStorage';

// Create context
const ContactContext = createContext();

/**
 * Custom hook to use contact context
 * @returns {Object} Contact context value
 * @throws {Error} If used outside ContactProvider
 */
export function useContactContext() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContactContext must be used within a ContactProvider');
  }
  return context;
}

/**
 * Contact Provider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function ContactProvider({ children }) {
  // Initialize state with session storage values
  const [state, dispatch] = useReducer(contactReducer, {
    contacts: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    sortBy: sessionStorage.getItem('contactSortBy') || 'name',
    sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc',
    search: sessionStorage.getItem('searchActive')
      ? sessionStorage.getItem('contactSearch') || ''
      : '',
    isOffline: false
  });

  /**
   * Load contacts with pagination and offline support
   * @param {boolean} loadMore - Whether to load more contacts or reset
   */
  const loadContacts = async (loadMore = false) => {
    if (state.loading) return;

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const page = loadMore ? state.page + 1 : 1;
      const pendingContacts = localStorageUtil.getPendingContacts();
      
      try {
        // Try to fetch from server
        const response = await api.getContacts(
          page,
          100,
          state.sortBy,
          state.sortOrder,
          state.search
        );

        if (Array.isArray(response.phonebooks)) {
          // Filter out duplicates
          const existingIds = new Set(pendingContacts.map(contact => contact.id));
          const uniqueServerContacts = response.phonebooks.filter(contact => {
            const isDuplicate = existingIds.has(contact.id.toString());
            if (!isDuplicate) {
              existingIds.add(contact.id.toString());
            }
            return !isDuplicate;
          });

          // Save to localStorage and update state
          localStorageUtil.saveAllContacts(uniqueServerContacts);
          const allContacts = [...pendingContacts, ...uniqueServerContacts];

          if (loadMore) {
            // Add new contacts to existing list
            const existingStateIds = new Set(state.contacts.map(c => c.id.toString()));
            const uniqueNewContacts = allContacts.filter(contact => 
              !existingStateIds.has(contact.id.toString())
            );
            
            dispatch({
              type: ACTIONS.SET_CONTACTS,
              payload: [...state.contacts, ...uniqueNewContacts],
            });
          } else {
            // Replace entire contact list
            dispatch({
              type: ACTIONS.SET_CONTACTS,
              payload: allContacts,
            });
          }

          // Update pagination and online status
          dispatch({
            type: ACTIONS.SET_HAS_MORE,
            payload: page < response.pages,
          });
          dispatch({ type: ACTIONS.SET_PAGE, payload: page });
          dispatch({ type: ACTIONS.SET_OFFLINE, payload: false });
        }
      } catch (error) {
        // Handle offline mode
        console.log('Server unavailable, loading from localStorage');
        const offlineContacts = localStorageUtil.getAllContacts();
        const existingIds = new Set(pendingContacts.map(contact => contact.id));
        const uniqueOfflineContacts = offlineContacts.filter(contact => {
          const isDuplicate = existingIds.has(contact.id.toString());
          if (!isDuplicate) {
            existingIds.add(contact.id.toString());
          }
          return !isDuplicate;
        });

        if (loadMore && state.isOffline) {
          dispatch({ type: ACTIONS.SET_HAS_MORE, payload: false });
        } else {
          dispatch({
            type: ACTIONS.SET_CONTACTS,
            payload: [...pendingContacts, ...uniqueOfflineContacts],
          });
          dispatch({ type: ACTIONS.SET_HAS_MORE, payload: false });
          dispatch({ type: ACTIONS.SET_OFFLINE, payload: true });
        }
      }
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      console.error('Failed to load contacts:', err);
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  };

  /**
   * Handle contact search
   * @param {string} value - Search query
   */
  const handleSearch = (value) => {
    dispatch({ type: ACTIONS.UPDATE_SEARCH, payload: value });
    if (value) {
      sessionStorage.setItem('contactSearch', value);
      sessionStorage.setItem('searchActive', 'true');
    } else {
      sessionStorage.removeItem('contactSearch');
      sessionStorage.removeItem('searchActive');
    }
  };

  /**
   * Handle contact sorting
   * @param {string} field - Field to sort by
   * @param {string} order - Sort order ('asc' or 'desc')
   */
  const handleSort = (field, order) => {
    sessionStorage.setItem('contactSortBy', field);
    sessionStorage.setItem('contactSortOrder', order);
    dispatch({
      type: ACTIONS.UPDATE_SORT,
      payload: { sortBy: field, sortOrder: order },
    });
  };

  /**
   * Handle contact edit
   * @param {string} id - Contact ID
   * @param {Object} updatedContact - Updated contact data
   */
  const handleEdit = async (id, updatedContact) => {
    try {
      const currentContact = state.contacts.find(c => c.id === id);
      const contactToUpdate = {
        ...updatedContact,
        photo: currentContact?.photo || updatedContact.photo || null
      };

      await api.updateContact(id, contactToUpdate);
      
      let newContacts = state.contacts.map((contact) =>
        contact.id === id ? { ...contactToUpdate, id } : contact
      );

      // Remove from list if it no longer matches search
      if (state.search) {
        const match =
          contactToUpdate.name.toLowerCase().includes(state.search.toLowerCase()) ||
          contactToUpdate.phone.toLowerCase().includes(state.search.toLowerCase());
        if (!match) {
          newContacts = state.contacts.filter((contact) => contact.id !== id);
        }
      }
      dispatch({ type: ACTIONS.SET_CONTACTS, payload: newContacts });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      console.error('Failed to update contact:', error);
    }
  };

  /**
   * Handle contact deletion
   * @param {string} id - Contact ID
   */
  const handleDelete = async (id) => {
    try {
      if (id && typeof id === 'string' && id.startsWith('pending_')) {
        localStorageUtil.removePendingContact(id);
      } else if (id) {
        await api.deleteContact(id);
      }
      dispatch({ 
        type: ACTIONS.SET_CONTACTS, 
        payload: state.contacts.filter((contact) => contact.id !== id) 
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      console.error('Failed to delete contact:', error);
    }
  };

  /**
   * Handle successful pending contact resend
   * @param {string} pendingId - Pending contact ID
   * @param {Object} savedContact - Successfully saved contact
   */
  const handleResendSuccess = async (pendingId, savedContact) => {
    const updatedContacts = state.contacts.map(contact =>
      contact.id === pendingId ? { ...savedContact, status: undefined } : contact
    );
    dispatch({ type: ACTIONS.SET_CONTACTS, payload: updatedContacts });
  };

  /**
   * Refresh contact list
   */
  const handleRefreshContacts = () => {
    dispatch({ type: ACTIONS.CLEAR_CONTACTS });
    loadContacts(false);
  };

  // Context value
  const value = {
    state,
    loadContacts,
    handleSearch,
    handleSort,
    handleEdit,
    handleDelete,
    handleResendSuccess,
    handleRefreshContacts
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}
