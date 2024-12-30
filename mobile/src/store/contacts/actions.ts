import { Dispatch } from 'redux';
import { getContacts, addContact, updateContact, deleteContact } from '../../services/api';
import { ContactData } from '../../types';
import {
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
  ADD_CONTACT_SUCCESS,
  UPDATE_CONTACT_SUCCESS,
  DELETE_CONTACT_SUCCESS,
  ContactsActionTypes,
  AppThunk,
} from './types';

export const fetchContacts = (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
  search: string = ''
): AppThunk => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CONTACTS_REQUEST });

    try {
      const response = await getContacts(page, limit, sortBy, sortOrder, search);
      dispatch({
        type: FETCH_CONTACTS_SUCCESS,
        payload: {
          ...response,
          isAppend: page > 1,
        },
      });
    } catch (error) {
      dispatch({
        type: FETCH_CONTACTS_FAILURE,
        payload: 'Failed to fetch contacts. Please check your connection and try again.',
      });
    }
  };
};

export const createContact = (contactData: ContactData): AppThunk<Promise<boolean>> => {
  return async (dispatch) => {
    try {
      const response = await addContact(contactData);
      if (response) {
        dispatch({
          type: ADD_CONTACT_SUCCESS,
          payload: response,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in createContact:', error);
      return false;
    }
  };
};

export const editContact = (id: number, contactData: ContactData): AppThunk<Promise<boolean>> => {
  return async (dispatch) => {
    try {
      const response = await updateContact(id, contactData);
      if (response) {
        dispatch({
          type: UPDATE_CONTACT_SUCCESS,
          payload: { ...response, id },
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in editContact:', error);
      return false;
    }
  };
};

export const removeContact = (id: number): AppThunk<Promise<boolean>> => {
  return async (dispatch) => {
    try {
      const response = await deleteContact(id);
      if (response) {
        dispatch({
          type: DELETE_CONTACT_SUCCESS,
          payload: id,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in removeContact:', error);
      return false;
    }
  };
};
