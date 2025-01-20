/**
 * Contact Actions
 * Constants and action creators for contact management
 */

// Action Types
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_CONTACTS = 'SET_CONTACTS';
export const ADD_MORE_CONTACTS = 'ADD_MORE_CONTACTS';
export const CLEAR_CONTACTS = 'CLEAR_CONTACTS';
export const ADD_CONTACT = 'ADD_CONTACT';
export const SET_PAGE = 'SET_PAGE';
export const SET_HAS_MORE = 'SET_HAS_MORE';
export const UPDATE_SORT = 'UPDATE_SORT';
export const UPDATE_SEARCH = 'UPDATE_SEARCH';
export const SET_OFFLINE = 'SET_OFFLINE';

// Action Creators
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error
});

export const setContacts = (contacts) => ({
  type: SET_CONTACTS,
  payload: contacts
});

export const addMoreContacts = (contacts) => ({
  type: ADD_MORE_CONTACTS,
  payload: contacts
});

export const clearContacts = () => ({
  type: CLEAR_CONTACTS
});

export const addContact = (contact) => ({
  type: ADD_CONTACT,
  payload: contact
});

export const setPage = (page) => ({
  type: SET_PAGE,
  payload: page
});

export const setHasMore = (hasMore) => ({
  type: SET_HAS_MORE,
  payload: hasMore
});

export const updateSort = (sortBy, sortOrder) => ({
  type: UPDATE_SORT,
  payload: { sortBy, sortOrder }
});

export const updateSearch = (search) => ({
  type: UPDATE_SEARCH,
  payload: search
});

export const setOffline = (isOffline) => ({
  type: SET_OFFLINE,
  payload: isOffline
});
