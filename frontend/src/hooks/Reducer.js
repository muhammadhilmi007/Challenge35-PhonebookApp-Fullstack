// Actions for managing contacts
export const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONTACTS: 'SET_CONTACTS',
  ADD_MORE_CONTACTS: 'ADD_MORE_CONTACTS',
  SET_PAGE: 'SET_PAGE',
  SET_HAS_MORE: 'SET_HAS_MORE',
  UPDATE_SORT: 'UPDATE_SORT',
  UPDATE_SEARCH: 'UPDATE_SEARCH',
  CLEAR_CONTACTS: 'CLEAR_CONTACTS',
  SET_OFFLINE: 'SET_OFFLINE'
};

// Reducer to handle contact state changes
export function contactReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.SET_CONTACTS:
      return { ...state, contacts: action.payload };

    case ACTIONS.ADD_MORE_CONTACTS:
      return { 
        ...state, 
        contacts: [...state.contacts, ...action.payload] 
      };

    case ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };

    case ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };

    case ACTIONS.UPDATE_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        page: 1,
        contacts: []
      };

    case ACTIONS.UPDATE_SEARCH:
      return { ...state, search: action.payload };

    case ACTIONS.CLEAR_CONTACTS:
      return {
        ...state,
        contacts: [],
        page: 1,
        hasMore: true,
        isOffline: false
      };

    case ACTIONS.SET_OFFLINE:
      return { ...state, isOffline: action.payload };

    default:
      return state;
  }
}
