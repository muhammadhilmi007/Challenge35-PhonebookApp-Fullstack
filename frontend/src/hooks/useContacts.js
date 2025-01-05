import React, { useReducer, useContext, createContext, useEffect, useCallback } from "react";
import {api} from "../services/api";

// Create Contact Context
const ContactContext = createContext();

// Initial state for reducer
const initialState = {
  contacts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  sortBy: sessionStorage.getItem('contactSortBy') || 'name',
  sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc',
  search: sessionStorage.getItem('searchActive') ? (sessionStorage.getItem('contactSearch') || '') : ''
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONTACTS: 'SET_CONTACTS',
  APPEND_CONTACTS: 'APPEND_CONTACTS',
  SET_PAGE: 'SET_PAGE',
  SET_HAS_MORE: 'SET_HAS_MORE',
  SET_SORT: 'SET_SORT',
  SET_SEARCH: 'SET_SEARCH',
  RESET_CONTACTS: 'RESET_CONTACTS'
};

// Reducer function
const contactReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_CONTACTS:
      return { ...state, contacts: action.payload };
    case ACTIONS.APPEND_CONTACTS:
      return { ...state, contacts: [...state.contacts, ...action.payload] };
    case ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };
    case ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };
    case ACTIONS.SET_SORT:
      return { 
        ...state, 
        sortBy: action.payload.sortBy, 
        sortOrder: action.payload.sortOrder,
        page: 1,
        contacts: [] 
      };
    case ACTIONS.SET_SEARCH:
      return { ...state, search: action.payload };
    case ACTIONS.RESET_CONTACTS:
      return { 
        ...state, 
        contacts: [], 
        page: 1, 
        hasMore: true 
      };
    default:
      return state;
  }
};

// Contact Provider Component
const ContactProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  const loadContacts = useCallback(async (loadMore = false) => {
    if (state.loading) return;

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    
    try {
      const currentPage = loadMore ? state.page + 1 : 1;
      
      const { phonebooks, ...pagination } = await api.getContacts(
        currentPage,
        10,
        state.sortBy,
        state.sortOrder,
        state.search
      );

      if (Array.isArray(phonebooks)) {
        if (loadMore) {
          const existingIds = new Set(state.contacts.map(contact => contact.id));
          const newContacts = phonebooks.filter(contact => !existingIds.has(contact.id));
          dispatch({ type: ACTIONS.APPEND_CONTACTS, payload: newContacts });
        } else {
          dispatch({ type: ACTIONS.SET_CONTACTS, payload: phonebooks });
        }
        
        dispatch({ type: ACTIONS.SET_HAS_MORE, payload: currentPage < pagination.pages });
        dispatch({ type: ACTIONS.SET_PAGE, payload: currentPage });
        console.log('API Response UseContacts:', phonebooks);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Error fetching contacts' });
      console.error('Error loading contacts:', err);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.loading, state.page, state.sortBy, state.sortOrder, state.search, state.contacts]);

  const handleSearch = useCallback((value) => {
    dispatch({ type: ACTIONS.SET_SEARCH, payload: value });
    sessionStorage.setItem('contactSearch', value || '');
    if (value) {
      sessionStorage.setItem('searchActive', 'true');
    } else {
      sessionStorage.removeItem('searchActive');
    }
  }, []);

  const handleSort = useCallback((field, order) => {
    sessionStorage.setItem('contactSortBy', field);
    sessionStorage.setItem('contactSortOrder', order);
    dispatch({ 
      type: ACTIONS.SET_SORT, 
      payload: { sortBy: field, sortOrder: order } 
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem('contactSearch', state.search);
  }, [state.search]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: ACTIONS.RESET_CONTACTS });
      await loadContacts(false);
    };
    
    fetchData();
  }, [state.sortBy, state.sortOrder, state.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    state,
    dispatch,
    loadContacts,
    handleSearch,
    handleSort
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

// Custom hook to use contact context
const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

export { ContactProvider, useContacts, ACTIONS };