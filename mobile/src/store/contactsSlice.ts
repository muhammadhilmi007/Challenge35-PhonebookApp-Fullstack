import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getContacts, deleteContact, addContact as apiAddContact, updateContact as apiUpdateContact } from '../services/api';
import { Contact } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios
import { API_URL } from '../config'; // Import API_URL

interface ContactsState {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  avatarLoading: boolean;
}

const initialState: ContactsState = {
  phonebooks: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  isOffline: false,
  avatarLoading: false,
};

type SortOrder = 'asc' | 'desc';

// Storage Helper Functions
const storageHelpers = {
  getPendingContacts: async (): Promise<Contact[]> => {
    try {
      const contacts = await AsyncStorage.getItem('pendingContacts');
      return contacts ? JSON.parse(contacts) : [];
    } catch (error) {
      console.error('Error getting pending contacts:', error);
      return [];
    }
  },

  addToPendingContacts: async (contact: Contact) => {
    try {
      const pendingContacts = await storageHelpers.getPendingContacts();
      pendingContacts.unshift(contact);
      await AsyncStorage.setItem('pendingContacts', JSON.stringify(pendingContacts));
    } catch (error) {
      console.error('Error adding to pending contacts:', error);
    }
  },

  removePendingContact: async (id: string) => {
    try {
      const pendingContacts = await storageHelpers.getPendingContacts();
      const updatedContacts = pendingContacts.filter(contact => contact.id !== id);
      await AsyncStorage.setItem('pendingContacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Error removing pending contact:', error);
    }
  },
};

// Contact Helper Functions
const contactHelpers = {
  generateUniqueId: async (): Promise<string> => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const pendingContacts = await storageHelpers.getPendingContacts();
    let id = `pending_${timestamp}_${random}`;
    
    // Keep generating until we find a unique ID
    while (pendingContacts.some(contact => contact.id === id)) {
      id = `pending_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      // Add small delay to ensure unique timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    return id;
  },

  createPendingContact: async (contact: Omit<Contact, 'id' | 'status' | 'sent'>): Promise<Contact> => ({
    ...contact,
    id: await contactHelpers.generateUniqueId(),
    status: 'pending',
    sent: false,
  }),

  // Helper to deduplicate contacts
  deduplicateContacts: (contacts: Contact[]): Contact[] => {
    const seen = new Map<string, Contact>();
    
    // Process contacts in reverse to keep the newest version
    for (let i = contacts.length - 1; i >= 0; i--) {
      const contact = contacts[i];
      if (!seen.has(contact.id)) {
        seen.set(contact.id, contact);
      }
    }
    
    return Array.from(seen.values()).reverse();
  }
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async ({ 
    page = 1, 
    limit = 10, 
    sortBy = 'name', 
    sortOrder = 'asc' as SortOrder, 
    search = '' 
  }: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
    search?: string;
  }) => {
    try {
      const pendingContacts = await storageHelpers.getPendingContacts();
      const response = await getContacts(page, limit, sortBy, sortOrder, search);
      
      return { 
        response, 
        page,
        pendingContacts,
        isOffline: false 
      };
    } catch (error) {
      const pendingContacts = await storageHelpers.getPendingContacts();
      const cachedContacts = await AsyncStorage.getItem('cachedContacts');
      let phonebooks = pendingContacts;
      
      if (cachedContacts) {
        const parsed = JSON.parse(cachedContacts);
        phonebooks = [...pendingContacts, ...parsed.filter((cached: { id: string; }) => 
          !pendingContacts.some(pending => pending.id === cached.id)
        )];
      }
      
      return {
        response: {
          phonebooks,
          total: phonebooks.length,
          page: 1,
          pages: 1
        },
        page: 1,
        pendingContacts,
        isOffline: true
      };
    }
  }
);

export const addContact = createAsyncThunk(
  'contacts/addContact',
  async (contact: Omit<Contact, 'id'>, { dispatch, getState }) => {
    try {
      const savedContact = await apiAddContact(contact as Contact);
      return { success: true, contact: savedContact, isOffline: false };
    } catch (error) {
      // Create a pending contact when offline
      const pendingContact = await contactHelpers.createPendingContact(contact);
      await storageHelpers.addToPendingContacts(pendingContact);
      
      // Cache current contacts for offline use
      const state = getState() as any;
      const currentContacts = state.contacts.phonebooks;
      await AsyncStorage.setItem('cachedContacts', JSON.stringify(currentContacts));
      
      return { success: true, contact: pendingContact, isOffline: true };
    }
  }
);

export const resendContact = createAsyncThunk(
  'contacts/resendContact',
  async (contact: Contact, { rejectWithValue }) => {
    try {
      const savedContact = await apiAddContact(contact);
      await storageHelpers.removePendingContact(contact.id);
      return {
        pendingId: contact.id,
        savedContact: { ...savedContact, sent: true },
      };
    } catch (error) {
      return rejectWithValue('Failed to resend contact');
    }
  }
);

export const updateAvatar = createAsyncThunk(
  'contacts/updateAvatar',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid contact ID');
      }

      const response = await axios.put(
        `${API_URL}/phonebooks/${numericId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        }
      );

      return { id: numericId, photo: response.data.photo };
    } catch (error) {
      return rejectWithValue('Failed to update avatar');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, contact }: { id: string; contact: Partial<Contact> }, { rejectWithValue, dispatch }) => {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid contact ID');
      }

      // First update contact details
      const updatedContact = await apiUpdateContact(numericId, contact);

      // If avatar is included, update it separately
      if (contact.avatar) {
        const formData = new FormData();
        const filename = contact.avatar.split('/').pop() || '';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';

        formData.append('photo', {
          uri: contact.avatar,
          type: `image/${ext}`,
          name: filename,
        } as any);

        await dispatch(updateAvatar({ id, formData })).unwrap();
      }

      return { success: true, contact: updatedContact };
    } catch (error) {
      return rejectWithValue('Failed to update contact');
    }
  }
);

export const removeContact = createAsyncThunk(
  'contacts/removeContact',
  async (id: string) => {
    const success = await deleteContact(id);
    if (!success) {
      throw new Error('Failed to delete contact');
    }
    return id;
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        const { response, page, pendingContacts, isOffline } = action.payload;
        
        if (page === 1) {
          // For first page, combine and deduplicate contacts
          const allContacts = [...pendingContacts, ...response.phonebooks];
          state.phonebooks = contactHelpers.deduplicateContacts(allContacts);
        } else {
          // For subsequent pages, add new unique contacts
          const currentIds = new Set(state.phonebooks.map(c => c.id));
          const newContacts = response.phonebooks.filter(c => !currentIds.has(c.id));
          state.phonebooks = contactHelpers.deduplicateContacts([...state.phonebooks, ...newContacts]);
        }
        
        // Update pagination info
        state.total = isOffline ? state.phonebooks.length : response.total + pendingContacts.length;
        state.page = response.page;
        state.pages = response.pages;
        state.loading = false;
        state.isOffline = isOffline;
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contacts';
        state.isOffline = true;
      })
      .addCase(addContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addContact.fulfilled, (state, action) => {
        const { contact, isOffline } = action.payload;
        
        // Remove any existing contact with the same ID
        state.phonebooks = state.phonebooks.filter(c => c.id !== contact.id);
        
        // Add the new contact at the beginning
        state.phonebooks.unshift(contact);
        state.total += 1;
        
        // Update offline state if needed
        if (isOffline) {
          state.isOffline = true;
        }
        
        state.loading = false;
        state.error = null;
      })
      .addCase(addContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add contact';
      })
      .addCase(resendContact.fulfilled, (state, action) => {
        const { pendingId, savedContact } = action.payload;
        const index = state.phonebooks.findIndex(contact => contact.id === pendingId);
        if (index !== -1) {
          state.phonebooks[index] = savedContact;
        }
      })
      .addCase(resendContact.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateAvatar.pending, (state) => {
        state.avatarLoading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        const { id, photo } = action.payload;
        const contact = state.phonebooks.find(c => parseInt(c.id, 10) === id);
        if (contact) {
          contact.photo = photo;
        }
        state.avatarLoading = false;
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const updatedContact = action.payload.contact;
        const index = state.phonebooks.findIndex(contact => contact.id === updatedContact.id);
        if (index !== -1) {
          state.phonebooks[index] = {
            ...state.phonebooks[index],
            ...updatedContact,
          };
        }
        state.loading = false;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeContact.fulfilled, (state, action) => {
        state.phonebooks = state.phonebooks.filter(contact => contact.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        state.loading = false;
      })
      .addCase(removeContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete contact';
      });
  },
});

export default contactsSlice.reducer;
