import axios from 'axios';
import { Contact, ContactsResponse } from '../types';
import { API_URL } from '../config';

type SortOrder = 'asc' | 'desc';

export const getContacts = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'name',
  sortOrder: SortOrder = 'asc',
  search: string = ''
): Promise<ContactsResponse> => {
  try {
    const response = await axios.get<ContactsResponse>(`${API_URL}/phonebooks`, {
      params: { page, limit, sortBy, sortOrder, name: search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const addContact = async (contact: Contact): Promise<Contact> => {
  try {
    // First create contact without avatar
    const response = await axios.post<Contact>(`${API_URL}/phonebooks`, {
      name: contact.name,
      phone: contact.phone,
    });

    // If contact has an avatar, update it separately
    if (contact.avatar && response.data.id) {
      const formData = new FormData();
      
      // Get the filename from the URI
      const filename = contact.avatar.split('/').pop() || '';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      
      formData.append('photo', {
        uri: contact.avatar,
        type: `image/${ext}`,
        name: filename,
      } as any);

      await axios.put(
        `${API_URL}/phonebooks/${response.data.id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    }

    return response.data;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const updateContact = async (id: number, contact: Partial<Contact>): Promise<Contact> => {
  try {
    // Prepare the contact data for update
    const updateData = {
      name: contact.name,
      phone: contact.phone,
    };

    // Update contact details
    const response = await axios.put<Contact>(
      `${API_URL}/phonebooks/${id}`,
      updateData
    );

    // If avatar is included, update it separately
    if (contact.avatar) {
      const formData = new FormData();
      const filename = contact.avatar.split('/').pop() || '';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';

      formData.append('photo', {
        uri: contact.avatar,
        type: `image/${ext}`,
        name: `avatar_${id}.${ext}`,
      } as any);

      try {
        const photoResponse = await axios.put(
          `${API_URL}/phonebooks/${id}/avatar`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          }
        );

        // Merge the photo update response with the contact update response
        return {
          ...response.data,
          photo: photoResponse.data.photo,
        };
      } catch (photoError) {
        console.error('Error updating photo:', photoError);
        // Return the contact data even if photo update fails
        return response.data;
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/phonebooks/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};
