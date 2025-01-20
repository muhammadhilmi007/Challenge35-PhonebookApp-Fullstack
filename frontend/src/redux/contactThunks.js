/**
 * Contact Thunks
 * Async action creators for contact management
 */

import { api } from '../services/api';
import {
  setLoading,
  setError,
  setContacts,
  setPage,
  setHasMore,
  setOffline
} from './contactActions';

// Load contacts
export const loadContacts = (loadMore = false) => async (dispatch, getState) => {
  const state = getState();
  if (state.loading) return;

  dispatch(setLoading(true));

  try {
    const page = loadMore ? state.page + 1 : 1;
    const limit = 10;

    // Get pending contacts and existing contacts from sessionStorage
    const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
    const existingContacts = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');

    try {
      const response = await api.getContacts(
        page,
        limit,
        state.sortBy,
        state.sortOrder,
        state.search
      );

      if (Array.isArray(response.phonebooks)) {
        // Save server contacts to sessionStorage
        if (!loadMore) {
          sessionStorage.setItem('existingContacts', JSON.stringify(response.phonebooks));
        } else {
          const currentExisting = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
          sessionStorage.setItem('existingContacts', JSON.stringify([...currentExisting, ...response.phonebooks]));
        }

        let allContacts;
        if (loadMore) {
          // For infinite scroll, add new contacts to existing ones
          allContacts = [...state.contacts, ...response.phonebooks];
        } else {
          // For initial load or refresh, combine pending and server contacts
          allContacts = [...pendingContacts, ...response.phonebooks];
        }

        // Apply search filter if search term exists
        const filteredContacts = state.search
          ? allContacts.filter(contact =>
              contact.name.toLowerCase().includes(state.search.toLowerCase()) ||
              contact.phone.toLowerCase().includes(state.search.toLowerCase())
            )
          : allContacts;

        // Sort the filtered contacts
        const sortedContacts = [...filteredContacts].sort((a, b) => {
          const aValue = (a[state.sortBy] || '').toString().toLowerCase();
          const bValue = (b[state.sortBy] || '').toString().toLowerCase();
          const compareResult = aValue.localeCompare(bValue);
          return state.sortOrder === 'asc' ? compareResult : -compareResult;
        });

        dispatch(setContacts(sortedContacts));
        dispatch(setHasMore(page < response.pages));
        dispatch(setPage(page));
        dispatch(setOffline(false));
      }
    } catch (error) {
      console.log('Server unavailable, using sessionStorage data');

      // Combine pending and existing contacts
      const allContacts = [...pendingContacts, ...existingContacts];

      // Apply search filter if search term exists
      const filteredContacts = state.search
        ? allContacts.filter(contact =>
            contact.name.toLowerCase().includes(state.search.toLowerCase()) ||
            contact.phone.toLowerCase().includes(state.search.toLowerCase())
          )
        : allContacts;

      // Sort the filtered contacts
      const sortedContacts = [...filteredContacts].sort((a, b) => {
        const aValue = (a[state.sortBy] || '').toString().toLowerCase();
        const bValue = (b[state.sortBy] || '').toString().toLowerCase();
        const compareResult = aValue.localeCompare(bValue);
        return state.sortOrder === 'asc' ? compareResult : -compareResult;
      });

      if (!loadMore) {
        // For initial load in offline mode
        const initialBatch = sortedContacts.slice(0, limit);
        dispatch(setContacts(initialBatch));
        
        // Store remaining contacts for infinite scroll
        sessionStorage.setItem('remainingOfflineContacts', 
          JSON.stringify(sortedContacts.slice(limit))
        );
        
        dispatch(setHasMore(sortedContacts.length > limit));
      } else {
        // For infinite scroll in offline mode
        const remainingContacts = JSON.parse(
          sessionStorage.getItem('remainingOfflineContacts') || '[]'
        );
        
        if (remainingContacts.length > 0) {
          const nextBatch = remainingContacts.slice(0, limit);
          const newRemaining = remainingContacts.slice(limit);
          
          const updatedContacts = [...state.contacts, ...nextBatch];
          dispatch(setContacts(updatedContacts));
          
          sessionStorage.setItem('remainingOfflineContacts', 
            JSON.stringify(newRemaining)
          );
          
          dispatch(setHasMore(newRemaining.length > 0));
          dispatch(setPage(page));
        } else {
          dispatch(setHasMore(false));
        }
      }
      
      dispatch(setOffline(true));
    }
  } catch (err) {
    dispatch(setError(err.message));
    console.error('Failed to load contacts:', err);
  }

  dispatch(setLoading(false));
};

// Edit contact
export const editContact = (id, updatedContact) => async (dispatch, getState) => {
  try {
    const state = getState();
    const currentContact = state.contacts.find(c => c.id === id);
    const contactToUpdate = {
      ...updatedContact,
      photo: currentContact?.photo || updatedContact.photo || null
    };

    await api.updateContact(id, contactToUpdate);

    let newContacts = state.contacts.map((contact) =>
      contact.id === id ? { ...contactToUpdate, id } : contact
    );

    if (state.search) {
      const match =
        contactToUpdate.name.toLowerCase().includes(state.search.toLowerCase()) ||
        contactToUpdate.phone.toLowerCase().includes(state.search.toLowerCase());
      dispatch(loadContacts(false));
      if (!match) {
        newContacts = state.contacts.filter((contact) => contact.id !== id);
      }
    }
    dispatch(loadContacts(false));
    dispatch(setContacts(newContacts));
  } catch (error) {
    dispatch(setError(error.message));
    console.error('Failed to update contact:', error);
  }
};

// Delete contact
export const deleteContact = (id) => async (dispatch, getState) => {
  try {
    if (id && typeof id === 'string' && id.startsWith('pending_')) {
      const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
      const updatedPending = pendingContacts.filter(contact => contact.id !== id);
      sessionStorage.setItem('pendingContacts', JSON.stringify(updatedPending));
    } else if (id) {
      try {
        await api.deleteContact(id);
        const cachedContacts = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
        const updatedCached = cachedContacts.filter(contact => contact.id !== id);
        sessionStorage.setItem('existingContacts', JSON.stringify(updatedCached));
      } catch (error) {
        if (getState().isOffline) {
          const cachedContacts = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
          const updatedCached = cachedContacts.filter(contact => contact.id !== id);
          sessionStorage.setItem('existingContacts', JSON.stringify(updatedCached));
        } else {
          throw error;
        }
      }
    }

    dispatch(setContacts(getState().contacts.filter((contact) => contact.id !== id)));
  } catch (error) {
    dispatch(setError(error.message));
    console.error('Failed to delete contact:', error);
  }
};

// Add pending contact
export const addPendingContact = (contact) => (dispatch) => {
  const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
  const newContact = {
    ...contact,
    id: `pending_${Date.now()}`,
    status: 'pending'
  };
  pendingContacts.unshift(newContact);
  sessionStorage.setItem('pendingContacts', JSON.stringify(pendingContacts));
  //dispatch(loadContacts(false));
  return newContact;
};

// Add contact
export const addContact = (contact) => async (dispatch) => {
  try {
    const response = await api.addContact(contact);
    if (response.id) {
      //dispatch(loadContacts(false));
      return { success: true };
    }
  } catch (error) {
    console.log('Failed to add contact to server, saving to pending');
    const pendingContact = {
      ...contact,
      id: `pending_${Date.now()}`,
      status: 'pending',
      sent: false
    };
    const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
    pendingContacts.unshift(pendingContact);
    sessionStorage.setItem('pendingContacts', JSON.stringify(pendingContacts));
    //dispatch(loadContacts(false));
    return { success: true };
  }
  return { success: false };
};

// Update avatar
export const updateAvatar = (id, formData) => async (dispatch) => {
  try {
    await api.updateAvatar(id, formData);
    dispatch(loadContacts(false));
    return { success: true };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: "Failed to upload avatar" };
  }
};
