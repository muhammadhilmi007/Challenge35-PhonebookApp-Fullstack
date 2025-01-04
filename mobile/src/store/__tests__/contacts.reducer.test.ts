import { contactsReducer } from '../contacts/reducer';
import {
  ContactsState,
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
  ADD_CONTACT_REQUEST,
  ADD_CONTACT_SUCCESS,
  ADD_CONTACT_FAILURE,
  UPDATE_CONTACT_REQUEST,
  UPDATE_CONTACT_SUCCESS,
  UPDATE_CONTACT_FAILURE,
  DELETE_CONTACT_REQUEST,
  DELETE_CONTACT_SUCCESS,
  DELETE_CONTACT_FAILURE,
} from '../contacts/types';

describe('contacts reducer', () => {
  const initialState: ContactsState = {
    phonebooks: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
    isAppend: false,
  };

  it('should return the initial state', () => {
    expect(contactsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should handle FETCH_CONTACTS_REQUEST', () => {
    const action = { type: FETCH_CONTACTS_REQUEST };
    const expectedState = {
      ...initialState,
      loading: true,
    };
    expect(contactsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_CONTACTS_SUCCESS', () => {
    const mockContacts = [
      { id: 1, name: 'John Doe', phone: '123-456-7890' },
      { id: 2, name: 'Jane Smith', phone: '098-765-4321' },
    ];
    const action = {
      type: FETCH_CONTACTS_SUCCESS,
      payload: {
        phonebooks: mockContacts,
        total: 2,
        page: 1,
        pages: 1,
        isAppend: false
      },
    };
    const expectedState = {
      ...initialState,
      phonebooks: mockContacts,
      total: 2,
      page: 1,
      pages: 1,
      loading: false,
      isAppend: false,
    };
    expect(contactsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_CONTACTS_FAILURE', () => {
    const error = 'Failed to fetch contacts';
    const action = {
      type: FETCH_CONTACTS_FAILURE,
      payload: error,
    };
    const expectedState = {
      ...initialState,
      error,
      loading: false,
    };
    expect(contactsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_CONTACT_REQUEST', () => {
    const action = { type: ADD_CONTACT_REQUEST };
    const expectedState = {
      ...initialState,
      loading: false, // No change since reducer doesn't handle this action
    };
    expect(contactsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_CONTACT_SUCCESS', () => {
    const newContact = { id: 1, name: 'John Doe', phone: '123-456-7890' };
    const action = {
      type: ADD_CONTACT_SUCCESS,
      payload: newContact,
    };
    const expectedState = {
      ...initialState,
      phonebooks: [newContact],
      total: 1,
      loading: false,
    };
    expect(contactsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_CONTACT_SUCCESS', () => {
    const initialStateWithContacts = {
      ...initialState,
      phonebooks: [{ id: 1, name: 'John Doe', phone: '123-456-7890' }],
    };
    const updatedContact = { id: 1, name: 'John Smith', phone: '123-456-7890' };
    const action = {
      type: UPDATE_CONTACT_SUCCESS,
      payload: updatedContact,
    };
    const expectedState = {
      ...initialStateWithContacts,
      phonebooks: [updatedContact],
      loading: false,
    };
    expect(contactsReducer(initialStateWithContacts, action)).toEqual(expectedState);
  });

  it('should handle DELETE_CONTACT_SUCCESS', () => {
    const initialStateWithContacts = {
      ...initialState,
      phonebooks: [{ id: 1, name: 'John Doe', phone: '123-456-7890' }],
      total: 1,
    };
    const action = {
      type: DELETE_CONTACT_SUCCESS,
      payload: 1,
    };
    const expectedState = {
      ...initialStateWithContacts,
      phonebooks: [],
      total: 0,
      loading: false,
    };
    expect(contactsReducer(initialStateWithContacts, action)).toEqual(expectedState);
  });
});
