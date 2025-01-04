// Action Types
export const FETCH_CONTACTS_REQUEST = 'FETCH_CONTACTS_REQUEST';
export const FETCH_CONTACTS_SUCCESS = 'FETCH_CONTACTS_SUCCESS';
export const FETCH_CONTACTS_FAILURE = 'FETCH_CONTACTS_FAILURE';
export const ADD_CONTACT_SUCCESS = 'ADD_CONTACT_SUCCESS';
export const UPDATE_CONTACT_SUCCESS = 'UPDATE_CONTACT_SUCCESS';
export const DELETE_CONTACT_SUCCESS = 'DELETE_CONTACT_SUCCESS';

// Interface for Contact
export interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
}

// State Interface
export interface ContactsState {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
  isAppend: boolean;
}

// Action Interfaces
interface FetchContactsRequestAction {
  type: typeof FETCH_CONTACTS_REQUEST;
}

interface FetchContactsSuccessAction {
  type: typeof FETCH_CONTACTS_SUCCESS;
  payload: {
    phonebooks: Contact[];
    total: number;
    page: number;
    pages: number;
    isAppend: boolean;
  };
}

interface FetchContactsFailureAction {
  type: typeof FETCH_CONTACTS_FAILURE;
  payload: string;
}

interface AddContactSuccessAction {
  type: typeof ADD_CONTACT_SUCCESS;
  payload: Contact;
}

interface UpdateContactSuccessAction {
  type: typeof UPDATE_CONTACT_SUCCESS;
  payload: Contact;
}

interface DeleteContactSuccessAction {
  type: typeof DELETE_CONTACT_SUCCESS;
  payload: number;
}

export type ContactsActionTypes =
  | FetchContactsRequestAction
  | FetchContactsSuccessAction
  | FetchContactsFailureAction
  | AddContactSuccessAction
  | UpdateContactSuccessAction
  | DeleteContactSuccessAction;
