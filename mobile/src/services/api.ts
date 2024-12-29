import axios, { AxiosError } from 'axios';
import { Contact, ContactData, ContactsResponse } from '../types';

const API_URL = 'http://192.168.1.11:3001/api';

interface PhotoData {
  uri: string;
  name: string;
  type: string;
}

export const getContacts = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
  search: string = ''
): Promise<ContactsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/phonebooks`, {
      params: { page, limit, sortBy, sortOrder, name: search }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const addContact = async (contact: ContactData): Promise<Contact> => {
  try {
    const response = await axios.post(`${API_URL}/phonebooks`, {
      name: contact.name,
      phone: contact.phone,
    });

    if (contact.avatar && response.data.id) {
      const formData = new FormData();
      
      const filename = contact.avatar.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('photo', {
        uri: contact.avatar,
        name: filename,
        type,
      } as unknown as Blob);

      await axios.put(`${API_URL}/phonebooks/${response.data.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const updateContact = async (id: number, contact: ContactData): Promise<Contact> => {
  try {
    const response = await axios.put(`${API_URL}/phonebooks/${id}`, {
      name: contact.name,
      phone: contact.phone,
    });

    if (contact.avatar && !contact.avatar.startsWith('http')) {
      const formData = new FormData();
      
      const filename = contact.avatar.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('photo', {
        uri: contact.avatar,
        name: filename,
        type,
      } as unknown as Blob);

      await axios.put(`${API_URL}/phonebooks/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id: number): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_URL}/phonebooks/${id}`);
    return response.status === 200;
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to delete contact');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};
