import axios from 'axios';
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  uploadAvatar,
} from '../api';
import { Contact, ContactData, ContactsResponse } from '../../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const API_URL = 'http://192.168.1.28:3001/api';

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContacts', () => {
    it('should fetch contacts successfully', async () => {
      const mockResponse: ContactsResponse = {
        phonebooks: [
          { _id: '1', name: 'John Doe', phone: '123-456-7890' },
          { _id: '2', name: 'Jane Smith', phone: '098-765-4321' },
        ],
        total: 2,
        page: 1,
        pages: 1
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await getContacts();
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/phonebooks`, {
        params: { page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc', name: '' }
      });
    });

    it('should handle fetch contacts error', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getContacts()).rejects.toThrow('Network Error');
    });
  });

  describe('addContact', () => {
    const newContact: ContactData = { 
      name: 'John Doe', 
      phone: '123-456-7890'
    };

    it('should add contact successfully without avatar', async () => {
      const mockResponse: Contact = { _id: '1', ...newContact };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await addContact(newContact);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/phonebooks`, {
        name: newContact.name,
        phone: newContact.phone,
      });
    });

    it('should add contact with avatar successfully', async () => {
      const contactWithAvatar: ContactData = {
        ...newContact,
        avatar: 'file:///path/to/photo.jpg'
      };
      const mockResponse: Contact = { _id: '1', ...newContact };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });
      mockedAxios.put.mockResolvedValueOnce({ data: { ...mockResponse, avatar: 'avatar-url' } });

      const result = await addContact(contactWithAvatar);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/phonebooks`, {
        name: contactWithAvatar.name,
        phone: contactWithAvatar.phone,
      });
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${API_URL}/phonebooks/1/avatar`,
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
    });

    it('should handle add contact error', async () => {
      const error = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(addContact(newContact)).rejects.toThrow('Network Error');
    });
  });

  describe('updateContact', () => {
    const contactId = 1;
    const updatedContact: ContactData = { 
      name: 'John Smith', 
      phone: '123-456-7890'
    };

    it('should update contact successfully without avatar', async () => {
      const mockResponse: Contact = { _id: contactId, ...updatedContact };
      mockedAxios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await updateContact(contactId, updatedContact);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.put).toHaveBeenCalledWith(`${API_URL}/phonebooks/${contactId}`, {
        name: updatedContact.name,
        phone: updatedContact.phone,
      });
    });

    it('should update contact with avatar successfully', async () => {
      const contactWithAvatar: ContactData = {
        ...updatedContact,
        avatar: 'file:///path/to/photo.jpg'
      };
      const mockResponse: Contact = { _id: contactId, ...updatedContact };
      
      mockedAxios.put.mockResolvedValueOnce({ data: mockResponse });
      mockedAxios.put.mockResolvedValueOnce({ data: { ...mockResponse, avatar: 'avatar-url' } });

      const result = await updateContact(contactId, contactWithAvatar);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.put).toHaveBeenCalledWith(`${API_URL}/phonebooks/${contactId}`, {
        name: contactWithAvatar.name,
        phone: contactWithAvatar.phone,
      });
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${API_URL}/phonebooks/${contactId}/avatar`,
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
    });

    it('should handle update contact error', async () => {
      const error = new Error('Network Error');
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(updateContact(contactId, updatedContact)).rejects.toThrow('Network Error');
    });
  });

  describe('deleteContact', () => {
    const contactId = 1;

    it('should delete contact successfully', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ status: 200 });

      const result = await deleteContact(contactId);
      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`${API_URL}/phonebooks/${contactId}`);
    });

    it('should handle delete contact error', async () => {
      const error = new Error('Network Error');
      mockedAxios.delete.mockRejectedValueOnce(error);

      await expect(deleteContact(contactId)).rejects.toThrow('Network Error');
    });
  });
});
