/**
 * Contact Reducer
 * Manages the contact state in Redux store
 */

import {
  SET_LOADING,
  SET_ERROR,
  SET_CONTACTS,
  ADD_MORE_CONTACTS,
  CLEAR_CONTACTS,
  ADD_CONTACT,
  SET_PAGE,
  SET_HAS_MORE,
  UPDATE_SORT,
  UPDATE_SEARCH,
  SET_OFFLINE
} from './contactActions';

// Initial state
const initialState = {
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
};

// Selectors
export const selectContacts = state => state.contacts;
export const selectLoading = state => state.loading;
export const selectError = state => state.error;
export const selectHasMore = state => state.hasMore;
export const selectSearch = state => state.search;
export const selectIsOffline = state => state.isOffline;
export const selectSortBy = state => state.sortBy;
export const selectSortOrder = state => state.sortOrder;

// Reducer
const contactReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case SET_CONTACTS:
      return {
        ...state,
        contacts: action.payload
      };

    case ADD_MORE_CONTACTS:
      return {
        ...state,
        contacts: [...state.contacts, ...action.payload]
      };

    case ADD_CONTACT:
      return {
        ...state,
        contacts: [...state.contacts, action.payload]
      };

    case CLEAR_CONTACTS:
      return {
        ...state,
        contacts: [],
        page: 1,
        hasMore: true,
        isOffline: false
      };

    case SET_PAGE:
      return {
        ...state,
        page: action.payload
      };

    case SET_HAS_MORE:
      return {
        ...state,
        hasMore: action.payload
      };

    case UPDATE_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        page: 1,
        contacts: []
      };

    case UPDATE_SEARCH:
      return {
        ...state,
        search: action.payload
      };

    case SET_OFFLINE:
      return {
        ...state,
        isOffline: action.payload
      };

    default:
      return state;
  }
};

export default contactReducer;
