import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Constants
const STORAGE_KEYS = {
  SORT_BY: 'contactSortBy',
  SORT_ORDER: 'contactSortOrder',
  SEARCH: 'contactSearch',
  SEARCH_ACTIVE: 'searchActive'
};

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async ({ page, limit, sortBy, sortOrder, search }) => {
    const response = await api.getContacts(page, limit, sortBy, sortOrder, search);
    return { ...response, currentPage: page };
  }
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, updatedContact }, { getState }) => {
    const response = await api.updateContact(id, updatedContact);
    const { search } = getState().contacts;
    
    if (search) {
      const searchLower = search.toLowerCase();
      const isMatchingSearch = 
        updatedContact.name.toLowerCase().includes(searchLower) ||
        updatedContact.phone.toLowerCase().includes(searchLower);
      
      if (!isMatchingSearch) {
        return { id, shouldRemove: true };
      }
    }
    
    return { id, ...response, ...updatedContact };
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id) => {
    await api.deleteContact(id);
    return id;
  }
);

// Helper functions
const getInitialSearchState = () => {
  const isActive = sessionStorage.getItem(STORAGE_KEYS.SEARCH_ACTIVE);
  return isActive ? (sessionStorage.getItem(STORAGE_KEYS.SEARCH) || '') : '';
};

const handleSearchStorage = (searchValue) => {
  if (!searchValue) {
    sessionStorage.removeItem(STORAGE_KEYS.SEARCH);
    sessionStorage.removeItem(STORAGE_KEYS.SEARCH_ACTIVE);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SEARCH, searchValue);
    sessionStorage.setItem(STORAGE_KEYS.SEARCH_ACTIVE, 'true');
  }
};

// Initial state
const initialState = {
  contacts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  sortBy: sessionStorage.getItem(STORAGE_KEYS.SORT_BY) || 'name',
  sortOrder: sessionStorage.getItem(STORAGE_KEYS.SORT_ORDER) || 'asc',
  search: getInitialSearchState()
};

// Slice
const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      const searchValue = action.payload;
      state.search = searchValue;
      state.page = 1;
      state.contacts = [];
      state.hasMore = true;
      handleSearchStorage(searchValue);
    },
    clearSearch: (state) => {
      state.search = '';
      state.page = 1;
      state.contacts = [];
      state.hasMore = true;
      handleSearchStorage('');
    },
    setSort: (state, action) => {
      const { field, order } = action.payload;
      state.sortBy = field;
      state.sortOrder = order;
      state.page = 1;
      sessionStorage.setItem(STORAGE_KEYS.SORT_BY, field);
      sessionStorage.setItem(STORAGE_KEYS.SORT_ORDER, order);
    },
    resetContacts: (state) => {
      state.contacts = [];
      state.page = 1;
      state.hasMore = true;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch contacts cases
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        const { phonebooks, pages, currentPage } = action.payload;
        
        if (currentPage === 1) {
          state.contacts = phonebooks;
        } else {
          const existingIds = new Set(state.contacts.map(contact => contact.id));
          const newContacts = phonebooks.filter(contact => !existingIds.has(contact.id));
          state.contacts = [...state.contacts, ...newContacts];
        }
        
        state.page = currentPage;
        state.hasMore = currentPage < pages;
        state.loading = false;
        
        if (state.search) {
          console.log(`Search results for "${state.search}":`, phonebooks.length);
        }
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update contact cases
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.shouldRemove) {
          state.contacts = state.contacts.filter(contact => contact.id !== action.payload.id);
        } else {
          const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
          if (index !== -1) {
            state.contacts[index] = { ...state.contacts[index], ...action.payload };
          }
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete contact case
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
      });
  },
});

export const { setSearch, clearSearch, setSort, resetContacts, setPage } = contactsSlice.actions;
export default contactsSlice.reducer;
