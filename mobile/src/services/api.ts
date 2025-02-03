import axios from 'axios';
import { Contact } from '../store/contactsSlice';

export const API_URL = 'http://192.168.0.119:3001/api';
export const API_BASE_URL = 'http://192.168.0.119:3001';
export const DEFAULT_AVATAR = '/user-avatar.svg';
export const IMAGE_QUALITY = 0.5;
export const IMAGE_ASPECT: [number, number] = [1, 1];

type SortOrder = 'asc' | 'desc';

interface ContactsResponse {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
}

const handleError = (operation: string) => (error: unknown) => {
  console.error(`Error ${operation}:`, error);
  throw error;
};

const createFormData = (avatar: string, id?: number): FormData => {
  const formData = new FormData();
  const filename = avatar.split('/').pop() || '';
  const ext = filename.split('.').pop() || 'jpg';
  
  formData.append('photo', {
    uri: avatar,
    type: `image/${ext}`,
    name: id ? `avatar_${id}.${ext}` : filename,
  } as any);
  
  return formData;
};

export const getContacts = async (
  page = 1,
  limit = 10,
  sortBy = 'name',
  sortOrder: SortOrder = 'asc',
  search = ''
): Promise<ContactsResponse> =>
  axios.get<ContactsResponse>(`${API_URL}/phonebooks`, {
    params: { page, limit, sortBy, sortOrder, name: search }
  })
    .then(response => response.data)
    .catch(handleError('fetching contacts'));

export const addContact = async (contact: Contact): Promise<Contact> => {
  try {
    const response = await axios.post<Contact>(`${API_URL}/phonebooks`, {
      name: contact.name,
      phone: contact.phone,
    });

    if (contact.avatar && response.data.id) {
      await axios.put(
        `${API_URL}/phonebooks/${response.data.id}/avatar`,
        createFormData(contact.avatar),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    }

    return response.data;
  } catch (error) {
    return handleError('adding contact')(error);
  }
};

export const updateContact = async (id: number, contact: Partial<Contact>): Promise<Contact> => {
  try {
    const response = await axios.put<Contact>(
      `${API_URL}/phonebooks/${id}`,
      { name: contact.name, phone: contact.phone }
    );

    if (contact.avatar) {
      try {
        const photoResponse = await axios.put(
          `${API_URL}/phonebooks/${id}/avatar`,
          createFormData(contact.avatar, id),
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          }
        );
        return { ...response.data, photo: photoResponse.data.photo };
      } catch (photoError) {
        console.error('Error updating photo:', photoError);
        return response.data;
      }
    }

    return response.data;
  } catch (error) {
    return handleError('updating contact')(error);
  }
};

export const deleteContact = async (id: string): Promise<boolean> =>
  axios.delete(`${API_URL}/phonebooks/${id}`)
    .then(() => true)
    .catch(handleError('deleting contact'));
