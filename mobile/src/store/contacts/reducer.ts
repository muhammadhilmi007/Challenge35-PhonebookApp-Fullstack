import {
  ContactsState,
  ContactsActionTypes,
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
  ADD_CONTACT_SUCCESS,
  UPDATE_CONTACT_SUCCESS,
  DELETE_CONTACT_SUCCESS,
} from './types';

const initialState: ContactsState = {
  phonebooks: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  isAppend: false,
};

export const contactsReducer = (
  state: ContactsState = initialState,
  action: ContactsActionTypes
): ContactsState => {
  switch (action.type) {
    case FETCH_CONTACTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CONTACTS_SUCCESS:
      return {
        ...state,
        loading: false,
        phonebooks: action.payload.isAppend
          ? [...new Map([...state.phonebooks, ...action.payload.phonebooks].map(item => [item.id, item])).values()]
          : action.payload.phonebooks,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };

    case FETCH_CONTACTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_CONTACT_SUCCESS:
      return {
        ...state,
        phonebooks: [action.payload, ...state.phonebooks],
        total: state.total + 1,
      };

    case UPDATE_CONTACT_SUCCESS:
      return {
        ...state,
        phonebooks: state.phonebooks.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        ),
      };

    case DELETE_CONTACT_SUCCESS:
      return {
        ...state,
        phonebooks: state.phonebooks.filter(contact => contact.id !== action.payload),
        total: state.total - 1,
      };

    default:
      return state;
  }
};
