import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getContacts, deleteContact, addContact as apiAddContact, updateContact as apiUpdateContact } from '../services/api';
import { Contact } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios
import { API_URL } from '../services/api'; // Import API_URL

interface ContactsState {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  avatarLoading: boolean;
  currentSortOrder: 'asc' | 'desc';
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
  currentSortOrder: 'asc',
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

  addToPendingContacts: async (contact: Contact, sortOrder: SortOrder = 'asc') => {
    try {
      const pendingContacts = await storageHelpers.getPendingContacts();
      pendingContacts.push(contact);
      const sortedContacts = contactHelpers.sortContacts(pendingContacts, sortOrder);
      await AsyncStorage.setItem('pendingContacts', JSON.stringify(sortedContacts));
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

  getCachedContacts: async (): Promise<{ contacts: Contact[]; page: number; }> => {
    try {
      const cachedData = await AsyncStorage.getItem('cachedContacts');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return { contacts: [], page: 1 };
    } catch (error) {
      console.error('Error getting cached contacts:', error);
      return { contacts: [], page: 1 };
    }
  },

  cacheContacts: async (contacts: Contact[], page: number) => {
    try {
      const existingCache = await storageHelpers.getCachedContacts();
      let updatedContacts: Contact[] = [];

      if (page === 1) {
        // For first page, replace existing cache
        updatedContacts = contacts;
      } else {
        // For subsequent pages, append to existing cache
        const existingIds = new Set(existingCache.contacts.map(c => c.id));
        const newContacts = contacts.filter(c => !existingIds.has(c.id));
        updatedContacts = [...existingCache.contacts, ...newContacts];
      }

      await AsyncStorage.setItem('cachedContacts', JSON.stringify({
        contacts: updatedContacts,
        page: Math.max(existingCache.page, page)
      }));
    } catch (error) {
      console.error('Error caching contacts:', error);
    }
  },

  clearCache: async () => {
    try {
      await AsyncStorage.removeItem('cachedContacts');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
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

  sortContacts: (contacts: Contact[], sortOrder: SortOrder = 'asc'): Contact[] => {
    return [...contacts].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  },

  deduplicateContacts: (contacts: Contact[], sortOrder: SortOrder = 'asc'): Contact[] => {
    const seen = new Map<string, Contact>();
    
    // Process contacts in reverse to keep the newest version
    for (let i = contacts.length - 1; i >= 0; i--) {
      const contact = contacts[i];
      if (!seen.has(contact.id)) {
        seen.set(contact.id, contact);
      }
    }
    
    const uniqueContacts = Array.from(seen.values());
    return contactHelpers.sortContacts(uniqueContacts, sortOrder);
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
      
      // Cache the fetched contacts
      await storageHelpers.cacheContacts(response.phonebooks, page);
      
      return { 
        response, 
        page,
        pendingContacts,
        sortOrder,
        isOffline: false 
      };
    } catch (error) {
      const pendingContacts = await storageHelpers.getPendingContacts();
      const { contacts: cachedContacts, page: cachedPage } = await storageHelpers.getCachedContacts();
      
      // Combine pending and cached contacts
      let phonebooks = [...pendingContacts];
      
      if (cachedContacts.length > 0) {
        // Filter out any cached contacts that are now in pending
        const filteredCached = cachedContacts.filter(
          cached => !pendingContacts.some(pending => pending.id === cached.id)
        );
        
        // Calculate the start and end index for pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        // Sort all contacts
        const allContacts = contactHelpers.sortContacts([...phonebooks, ...filteredCached], sortOrder);
        
        // Get the slice of contacts for the current page
        phonebooks = allContacts.slice(startIndex, endIndex);
        
        return {
          response: {
            phonebooks,
            total: allContacts.length,
            page: page,
            pages: Math.ceil(allContacts.length / limit)
          },
          page,
          pendingContacts,
          sortOrder,
          isOffline: true
        };
      }
      
      // If no cached contacts, just return pending contacts
      return {
        response: {
          phonebooks,
          total: phonebooks.length,
          page: 1,
          pages: 1
        },
        page: 1,
        pendingContacts,
        sortOrder,
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
      // Get current state for sort order
      const state = getState() as any;
      const sortOrder = state.contacts.currentSortOrder;

      // Create a pending contact when offline
      const pendingContact = await contactHelpers.createPendingContact(contact);
      await storageHelpers.addToPendingContacts(pendingContact, sortOrder);
      
      // Cache current contacts for offline use
      const currentContacts = state.contacts.phonebooks;
      await AsyncStorage.setItem('cachedContacts', JSON.stringify(currentContacts));
      
      return { success: true, contact: pendingContact, isOffline: true, sortOrder };
    }
  }
);

export const resendContact = createAsyncThunk(
  'contacts/resendContact',
  async (contact: Contact, { getState, rejectWithValue }) => {
    try {
      const savedContact = await apiAddContact(contact);
      await storageHelpers.removePendingContact(contact.id);
      
      // Get current sort order from state
      const state = getState() as any;
      const sortOrder = state.contacts.currentSortOrder || 'asc';
      
      return {
        pendingId: contact.id,
        savedContact: { ...savedContact, sent: true },
        sortOrder
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
          transformResponse: [(data) => {
            // Parse the response data
            const parsedData = JSON.parse(data);
            return parsedData;
          }],
        }
      );

      if (!response.data || !response.data.photo) {
        throw new Error('Invalid response from server');
      }

      return { 
        id: id, // Keep original string ID
        photo: response.data.photo,
        success: true
      };
    } catch (error: any) {
      console.error('Avatar update error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update avatar');
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

        try {
          const avatarResult = await dispatch(updateAvatar({ id, formData })).unwrap();
          if (avatarResult.success) {
            updatedContact.photo = avatarResult.photo;
          }
        } catch (avatarError) {
          console.error('Avatar update failed:', avatarError);
          // Continue with contact update even if avatar update fails
        }
      }

      return { success: true, contact: updatedContact };
    } catch (error: any) {
      console.error('Contact update error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact');
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
        if (state.phonebooks.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        const { response, page, pendingContacts, sortOrder, isOffline } = action.payload;
        state.currentSortOrder = sortOrder;
        
        if (page === 1) {
          // For first page, combine and deduplicate contacts
          const allContacts = [...pendingContacts, ...response.phonebooks];
          state.phonebooks = contactHelpers.deduplicateContacts(allContacts, sortOrder);
        } else {
          // For subsequent pages, add new unique contacts
          const currentIds = new Set(state.phonebooks.map(c => c.id));
          const newContacts = response.phonebooks.filter(c => !currentIds.has(c.id));
          state.phonebooks = contactHelpers.deduplicateContacts([...state.phonebooks, ...newContacts], sortOrder);
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
        const { contact, isOffline, sortOrder } = action.payload;
        
        // Remove any existing contact with the same ID
        state.phonebooks = state.phonebooks.filter(c => c.id !== contact.id);
        
        // Add the new contact and sort
        state.phonebooks = contactHelpers.deduplicateContacts([...state.phonebooks, contact], sortOrder || state.currentSortOrder);
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
        const { pendingId, savedContact, sortOrder } = action.payload;
        // Remove the pending contact
        state.phonebooks = state.phonebooks.filter(contact => contact.id !== pendingId);
        // Add the saved contact and resort
        state.phonebooks = contactHelpers.deduplicateContacts([...state.phonebooks, savedContact], sortOrder);
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
        // Find contact by string ID
        const contact = state.phonebooks.find(c => c.id === id);
        if (contact) {
          contact.photo = photo;
        }
        state.avatarLoading = false;
        state.error = null;
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.error = action.payload as string || 'Failed to update avatar';
      })
      .addCase(updateContact.pending, (state, action) => {
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const updatedContact = action.payload.contact;
        // Remove the old contact
        state.phonebooks = state.phonebooks.filter(contact => contact.id !== updatedContact.id);
        // Add the updated contact and resort the list
        state.phonebooks = contactHelpers.deduplicateContacts(
          [...state.phonebooks, updatedContact],
          state.currentSortOrder
        );
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeContact.pending, (state) => {
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
