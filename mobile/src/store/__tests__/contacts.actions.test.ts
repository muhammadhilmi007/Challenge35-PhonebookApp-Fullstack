import configureMockStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import * as actions from '../contacts/contacts.actions';
import { Contact } from '../../types';
import { mockNavigation } from '../../test/mocks/navigation';
import { getContacts, addContact, updateContact, deleteContact } from '../../services/api';
import { AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

jest.mock('../../services/api', () => ({
  getContacts: jest.fn(),
  addContact: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
}));

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureMockStore<RootState, DispatchExts>([thunk]);

describe('Contacts Actions', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      contacts: {
        phonebooks: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null,
        isAppend: false,
      },
    } as RootState);
    jest.clearAllMocks();
  });

  describe('fetchContacts', () => {
    it('dispatches correct actions when fetching contacts succeeds', async () => {
      const mockContacts: Contact[] = [
        { _id: '1', name: 'John Doe', phone: '1234567890' },
      ];
      (getContacts as jest.Mock).mockResolvedValueOnce({ phonebooks: mockContacts });

      await store.dispatch(actions.fetchContacts());
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/fetchContacts/pending');
      expect(dispatchedActions[1].type).toBe('contacts/fetchContacts/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockContacts);
    });

    it('dispatches correct actions when fetching contacts fails', async () => {
      const error = new Error('Failed to fetch');
      (getContacts as jest.Mock).mockRejectedValueOnce(error);

      await store.dispatch(actions.fetchContacts());
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/fetchContacts/pending');
      expect(dispatchedActions[1].type).toBe('contacts/fetchContacts/rejected');
    });
  });

  describe('addContact', () => {
    it('dispatches correct actions when adding contact succeeds', async () => {
      const newContact = { name: 'Jane Doe', phone: '0987654321' };
      const returnedContact = { _id: '2', ...newContact };
      (addContact as jest.Mock).mockResolvedValueOnce(returnedContact);

      await store.dispatch(actions.addContact({ contact: newContact, navigation: mockNavigation }));
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/addContact/pending');
      expect(dispatchedActions[1].type).toBe('contacts/addContact/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(returnedContact);
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('dispatches correct actions when adding contact fails', async () => {
      const error = new Error('Failed to add contact');
      const newContact = { name: 'Jane Doe', phone: '0987654321' };
      (addContact as jest.Mock).mockRejectedValueOnce(error);

      await store.dispatch(actions.addContact({ contact: newContact, navigation: mockNavigation }));
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/addContact/pending');
      expect(dispatchedActions[1].type).toBe('contacts/addContact/rejected');
    });
  });

  describe('updateContact', () => {
    it('dispatches correct actions when updating contact succeeds', async () => {
      const updatedContact = { _id: '1', name: 'John Updated', phone: '1111111111' };
      (updateContact as jest.Mock).mockResolvedValueOnce(updatedContact);

      await store.dispatch(actions.updateContact({ contact: updatedContact, navigation: mockNavigation }));
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/updateContact/pending');
      expect(dispatchedActions[1].type).toBe('contacts/updateContact/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(updatedContact);
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('dispatches correct actions when updating contact fails', async () => {
      const error = new Error('Failed to update contact');
      const updatedContact = { _id: '1', name: 'John Updated', phone: '1111111111' };
      (updateContact as jest.Mock).mockRejectedValueOnce(error);

      await store.dispatch(actions.updateContact({ contact: updatedContact, navigation: mockNavigation }));
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/updateContact/pending');
      expect(dispatchedActions[1].type).toBe('contacts/updateContact/rejected');
    });
  });

  describe('deleteContact', () => {
    it('dispatches correct actions when deleting contact succeeds', async () => {
      const contactId = '1';
      (deleteContact as jest.Mock).mockResolvedValueOnce(true);

      await store.dispatch(actions.deleteContact(contactId));
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/deleteContact/pending');
      expect(dispatchedActions[1].type).toBe('contacts/deleteContact/fulfilled');
      expect(dispatchedActions[1].payload).toBe(contactId);
    });

    it('dispatches correct actions when deleting contact fails', async () => {
      const error = new Error('Failed to delete contact');
      const contactId = '1';
      (deleteContact as jest.Mock).mockRejectedValueOnce(error);

      await store.dispatch(actions.deleteContact(contactId));
      const dispatchedActions = store.getActions();
      
      expect(dispatchedActions[0].type).toBe('contacts/deleteContact/pending');
      expect(dispatchedActions[1].type).toBe('contacts/deleteContact/rejected');
    });
  });
});
