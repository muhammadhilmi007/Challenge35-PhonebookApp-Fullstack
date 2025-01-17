/**
 * Contact State Management Module
 * 
 * Provides actions and reducer for managing contact state.
 * Uses React's useReducer pattern for state management.
 */

/**
 * Action Types
 * Constants for all possible state modifications
 */
export const ACTIONS = {
  // Loading state
  SET_LOADING: 'SET_LOADING',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  
  // Contact management
  SET_CONTACTS: 'SET_CONTACTS',
  ADD_MORE_CONTACTS: 'ADD_MORE_CONTACTS',
  CLEAR_CONTACTS: 'CLEAR_CONTACTS',
  ADD_CONTACT: 'ADD_CONTACT',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
  DELETE_CONTACT: 'DELETE_CONTACT',
  
  // Pagination
  SET_PAGE: 'SET_PAGE',
  SET_HAS_MORE: 'SET_HAS_MORE',
  
  // Sorting and filtering
  UPDATE_SORT: 'UPDATE_SORT',
  UPDATE_SEARCH: 'UPDATE_SEARCH',
  
  // Offline state
  SET_OFFLINE: 'SET_OFFLINE'
};

/**
 * Contact State Reducer
 * Handles all state transitions for the contact management system
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action to perform
 * @param {string} action.type - Type of action from ACTIONS
 * @param {*} action.payload - Data for the action
 * @returns {Object} New state
 */
export function contactReducer(state, action) {
  switch (action.type) {
    // Loading state management
    case ACTIONS.SET_LOADING:
      return { 
        ...state, 
        loading: action.payload 
      };

    // Error handling
    case ACTIONS.SET_ERROR:
      return { 
        ...state, 
        error: action.payload 
      };

    // Contact list management
    case ACTIONS.SET_CONTACTS:
      return { 
        ...state, 
        contacts: action.payload 
      };

    case ACTIONS.ADD_MORE_CONTACTS:
      return { 
        ...state, 
        contacts: [...state.contacts, ...action.payload] 
      };

    case ACTIONS.ADD_CONTACT:
      return { 
        ...state, 
        contacts: [...state.contacts, action.payload] 
      };

    case ACTIONS.CLEAR_CONTACTS:
      return {
        ...state,
        contacts: [],
        page: 1,
        hasMore: true,
        isOffline: false
      };

    // Pagination handling
    case ACTIONS.SET_PAGE:
      return { 
        ...state, 
        page: action.payload 
      };

    case ACTIONS.SET_HAS_MORE:
      return { 
        ...state, 
        hasMore: action.payload 
      };

    // Sort and search handling
    case ACTIONS.UPDATE_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        page: 1,
        contacts: []
      };

    case ACTIONS.UPDATE_SEARCH:
      return { 
        ...state, 
        search: action.payload 
      };

    // Offline state handling
    case ACTIONS.SET_OFFLINE:
      return { 
        ...state, 
        isOffline: action.payload 
      };

    // Default case
    default:
      return state;
  }
}

/**
 * Reducer Module Documentation
 * 
 * This module implements the reducer pattern for managing contact state.
 * It provides a predictable state container with clear actions and transitions.
 * 
 * State Structure:
 * - contacts: Array of contact objects
 * - loading: Boolean loading state
 * - error: Error message or null
 * - page: Current page number
 * - hasMore: Boolean for pagination
 * - sortBy: Field to sort by
 * - sortOrder: Sort direction
 * - search: Search query
 * - isOffline: Offline mode indicator
 * 
 * Usage Example:
 * ```javascript
 * dispatch({ 
 *   type: ACTIONS.SET_CONTACTS, 
 *   payload: newContacts 
 * });
 * ```
 */
