import { createAsyncThunk } from '@reduxjs/toolkit';
import { Contact, ContactData, ContactsResponse } from '../../types';
import { getContacts, addContact as addContactAPI, updateContact as updateContactAPI, deleteContact as deleteContactAPI } from '../../services/api';

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async () => {
    try {
      const response = await getContacts();
      return response.phonebooks;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addContact = createAsyncThunk(
  'contacts/addContact',
  async ({ contact, navigation }: { contact: ContactData, navigation: any }) => {
    try {
      const response = await addContactAPI(contact);
      navigation.goBack();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ contact, navigation }: { contact: Contact, navigation: any }) => {
    try {
      const response = await updateContactAPI(contact._id, contact);
      navigation.goBack();
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (_id: string) => {
    try {
      await deleteContactAPI(_id);
      return _id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);
