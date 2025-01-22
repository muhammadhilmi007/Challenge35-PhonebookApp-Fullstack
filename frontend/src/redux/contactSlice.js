import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { api } from "../services/api";

/**
 * Constants
 */
const CONTACTS_PER_PAGE = 10;

/**
 * Initial Redux State
 * Manages the state for contacts including sorting, pagination, and offline functionality
 */
const initialState = {
  contacts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  sortBy: sessionStorage.getItem("contactSortBy") || "name",
  sortOrder: sessionStorage.getItem("contactSortOrder") || "asc",
  search: sessionStorage.getItem("searchActive")
    ? sessionStorage.getItem("contactSearch") || ""
    : "",
  isOffline: false,
  totalPages: 1,
};

/**
 * Storage Helper Functions
 * Functions to manage session storage operations
 */
const storageHelpers = {
  updateSearchStorage: (search) => {
    if (search) {
      sessionStorage.setItem("contactSearch", search);
      sessionStorage.setItem("searchActive", "true");
    } else {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    }
  },

  updateSortStorage: (sortBy, sortOrder) => {
    sessionStorage.setItem("contactSortBy", sortBy);
    sessionStorage.setItem("contactSortOrder", sortOrder);
  },

  getPendingContacts: () => 
    JSON.parse(sessionStorage.getItem("pendingContacts") || "[]"),

  getExistingContacts: () => 
    JSON.parse(sessionStorage.getItem("existingContacts") || "[]"),

  setExistingContacts: (contacts) => 
    sessionStorage.setItem("existingContacts", JSON.stringify(contacts)),

  updatePendingContacts: (id) => {
    const pendingContacts = storageHelpers.getPendingContacts();
    const updatedPendingContacts = pendingContacts.filter((c) => c.id !== id);
    sessionStorage.setItem("pendingContacts", JSON.stringify(updatedPendingContacts));
  },

  addToPendingContacts: (newContact) => {
    const pendingContacts = storageHelpers.getPendingContacts();
    pendingContacts.unshift(newContact);
    sessionStorage.setItem("pendingContacts", JSON.stringify(pendingContacts));
  }
};

/**
 * Contact Processing Helper Functions
 * Functions to handle contact filtering, sorting, and data manipulation
 */
const contactHelpers = {
  sortContacts: (contacts, sortBy, sortOrder) => {
    return [...contacts].sort((a, b) => {
      const aValue = (a[sortBy] || "").toString().toLowerCase();
      const bValue = (b[sortBy] || "").toString().toLowerCase();
      const compareResult = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? compareResult : -compareResult;
    });
  },

  filterContacts: (contacts, search) => {
    const searchTerm = search.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phone.toLowerCase().includes(searchTerm)
    );
  },

  createPendingContact: (contact) => ({
    ...contact,
    id: `pending_${Date.now()}`,
    status: "pending",
    sent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  contactMatchesSearch: (contact, search) => {
    const searchTerm = search.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.phone.toLowerCase().includes(searchTerm)
    );
  }
};

/**
 * State Update Helper Functions
 * Functions to handle Redux state updates
 */
const stateHelpers = {
  updateContactsState: (state, data, loadMore) => {
    if (loadMore && !state.isOffline) {
      const newContacts = data.filter(
        (newContact) =>
          !state.contacts.some((existing) => existing.id === newContact.id)
      );
      state.contacts = [
        ...state.contacts,
        ...contactHelpers.sortContacts(newContacts, state.sortBy, state.sortOrder),
      ];
      state.page = state.page + 1;
    } else if (state.isOffline && loadMore) {
      const startIndex = (state.page - 1) * CONTACTS_PER_PAGE;
      const endIndex = startIndex + CONTACTS_PER_PAGE;
      const offlineContacts = JSON.parse(
        sessionStorage.getItem("offlineFilteredContacts") || "[]"
      );
      const nextBatch = offlineContacts.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        state.contacts = [...state.contacts, ...nextBatch];
        state.page = state.page + 1;
      }
    } else {
      state.contacts = contactHelpers.sortContacts(data, state.sortBy, state.sortOrder);
      state.page = 1;
    }
  },

  updatePaginationState: (state, pages, hasMore) => {
    state.hasMore = hasMore !== undefined ? hasMore : state.page < pages;
    state.totalPages = pages;
  },

  updateContactInState: (state, id, updatedContact, search) => {
    if (search && !contactHelpers.contactMatchesSearch(updatedContact, search)) {
      state.contacts = state.contacts.filter((contact) => contact.id !== id);
      return;
    }

    state.contacts = state.contacts.filter((contact) => contact.id !== id);
    state.contacts.push({ ...updatedContact, id });
    state.contacts = contactHelpers.sortContacts(state.contacts, state.sortBy, state.sortOrder);
  },

  updateResendedContact: (state, pendingId, savedContact) => {
    const index = state.contacts.findIndex((contact) => contact.id === pendingId);
    if (index !== -1) {
      state.contacts[index] = {
        ...savedContact,
        id: savedContact._id || savedContact.id,
        status: undefined,
      };
    }
  }
};

/**
 * Offline Mode Handler
 * Manages contact operations when the app is offline
 */
const handleOfflineMode = (
  pendingContacts,
  existingContacts,
  sortBy,
  sortOrder,
  search,
  loadMore,
  limit,
  page
) => {
  const offlineContacts = JSON.parse(
    sessionStorage.getItem("offlineFilteredContacts") || "[]"
  );
  
  const allContacts = [...pendingContacts, ...existingContacts];
  const filteredContacts = search ? 
    contactHelpers.filterContacts(allContacts, search) : 
    allContacts;

  const sortedContacts = contactHelpers.sortContacts(filteredContacts, sortBy, sortOrder);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  let currentBatch;

  if (loadMore) {
    currentBatch = offlineContacts.slice(startIndex, endIndex);
  } else {
    sessionStorage.setItem(
      "offlineFilteredContacts",
      JSON.stringify(sortedContacts)
    );
    currentBatch = sortedContacts.slice(0, limit);
  }

  const totalPages = Math.ceil(sortedContacts.length / limit);
  const hasMore = sortedContacts.length > endIndex;

  return {
    data: loadMore ? currentBatch : sortedContacts,
    pages: totalPages,
    loadMore,
    isOffline: true,
    hasMore,
    totalItems: sortedContacts.length
  };
};

/**
 * Async Thunks
 * Redux Toolkit async actions for handling API operations
 */
export const loadContacts = createAsyncThunk(
  "contacts/loadContacts",
  async (
    { loadMore, sortBy, sortOrder, search },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState().contacts;
      const page = loadMore ? state.page + 1 : 1;
      const pendingContacts = storageHelpers.getPendingContacts();
      const existingContacts = storageHelpers.getExistingContacts();

      try {
        const response = await api.getContacts(
          page,
          CONTACTS_PER_PAGE,
          sortBy,
          sortOrder,
          search
        );

        if (Array.isArray(response.phonebooks)) {
          if (!loadMore) {
            storageHelpers.setExistingContacts(response.phonebooks);
          } else {
            const currentExisting = storageHelpers.getExistingContacts();
            storageHelpers.setExistingContacts([...currentExisting, ...response.phonebooks]);
          }

          const allContacts = [...pendingContacts, ...response.phonebooks];
          const filteredContacts = contactHelpers.filterContacts(allContacts, search);
          const sortedContacts = contactHelpers.sortContacts(filteredContacts, sortBy, sortOrder);

          return {
            data: sortedContacts,
            hasMore: response.hasMore,
            pages: response.pages,
            loadMore,
            isOffline: false,
          };
        }
      } catch (error) {
        console.info("Server unavailable, using sessionStorage data");
        return handleOfflineMode(
          pendingContacts,
          existingContacts,
          sortBy,
          sortOrder,
          search,
          loadMore,
          CONTACTS_PER_PAGE,
          page
        );
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateContact = createAsyncThunk(
  "contacts/updateContact",
  async ({ id, updatedContact }, { rejectWithValue, getState }) => {
    try {
      const currentContact = getState().contacts.contacts.find(
        (c) => c.id === id
      );
      const contactToUpdate = {
        ...updatedContact,
        photo: currentContact?.photo || updatedContact.photo || null,
      };
      await api.updateContact(id, contactToUpdate);
      return {
        id,
        updatedContact: contactToUpdate,
        search: getState().contacts.search,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteContact = createAsyncThunk(
  "contacts/deleteContact",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteContact(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendContact = createAsyncThunk(
  "contacts/resendContact",
  async ({ contact }, { rejectWithValue }) => {
    try {
      const savedContact = await api.addContact(contact);
      storageHelpers.updatePendingContacts(contact.id);
      return {
        pendingId: contact.id,
        savedContact: { ...savedContact, sent: true },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addContact = createAsyncThunk(
  "contacts/addContact",
  async (contact, { rejectWithValue, getState }) => {
    try {
      const response = await api.addContact(contact);
      if (response.id) {
        return { success: true, contact: response };
      }
      return { success: false };
    } catch (error) {
      const state = getState().contacts;
      const pendingContact = contactHelpers.createPendingContact(contact);
      
      storageHelpers.addToPendingContacts(pendingContact);
      
      const existingContacts = storageHelpers.getExistingContacts();
      const allContacts = [pendingContact, ...existingContacts];
      const filteredContacts = contactHelpers.filterContacts(allContacts, state.search);
      const sortedContacts = contactHelpers.sortContacts(filteredContacts, state.sortBy, state.sortOrder);
      
      sessionStorage.setItem(
        "offlineFilteredContacts",
        JSON.stringify(sortedContacts)
      );

      return {
        success: true,
        pendingContact,
        isOffline: true,
        allSortedContacts: sortedContacts,
        hasMore: sortedContacts.length > CONTACTS_PER_PAGE,
        totalPages: Math.ceil(sortedContacts.length / CONTACTS_PER_PAGE),
        totalItems: sortedContacts.length
      };
    }
  }
);

export const updateAvatar = createAsyncThunk(
  "contacts/updateAvatar",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      await api.updateAvatar(id, formData);
      return { success: true };
    } catch (error) {
      return rejectWithValue({ success: false, error: "Failed to upload avatar" });
    }
  }
);

/**
 * Selectors
 * Memoized selectors for accessing and computing state
 */
export const selectContacts = (state) => state.contacts.contacts;
export const selectSortBy = (state) => state.contacts.sortBy;
export const selectSortOrder = (state) => state.contacts.sortOrder;
export const selectSearch = (state) => state.contacts.search;

export const selectSortedAndFilteredContacts = createSelector(
  [selectContacts, selectSortBy, selectSortOrder, selectSearch],
  (contacts, sortBy, sortOrder, search) => {
    const sortedContacts = contactHelpers.sortContacts(contacts, sortBy, sortOrder);
    return search ? contactHelpers.filterContacts(sortedContacts, search) : sortedContacts;
  }
);

/**
 * Contact Slice
 * Redux slice containing reducers and actions for contact management
 */
const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      storageHelpers.updateSearchStorage(action.payload);
    },
    setSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
      state.page = 1;
      state.contacts = [];
      storageHelpers.updateSortStorage(sortBy, sortOrder);
    },
    clearContacts: (state) => {
      state.contacts = [];
      state.page = 1;
      state.hasMore = true;
      state.isOffline = false;
    },
    addPendingContact: (state, action) => {
      const newContact = contactHelpers.createPendingContact(action.payload);
      storageHelpers.addToPendingContacts(newContact);
      state.contacts = contactHelpers.sortContacts(
        [newContact, ...state.contacts],
        state.sortBy,
        state.sortOrder
      );
    },
    handleResendSuccess: (state, action) => {
      const { pendingId, savedContact } = action.payload;
      stateHelpers.updateResendedContact(state, pendingId, savedContact);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Contacts
      .addCase(loadContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadContacts.fulfilled, (state, action) => {
        const { data, pages, loadMore, isOffline, hasMore } = action.payload;
        stateHelpers.updateContactsState(state, data, loadMore);
        stateHelpers.updatePaginationState(state, pages, hasMore);
        state.loading = false;
        state.isOffline = isOffline;
        state.error = null;
      })
      .addCase(loadContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Contact
      .addCase(updateContact.fulfilled, (state, action) => {
        const { id, updatedContact, search } = action.payload;
        stateHelpers.updateContactInState(state, id, updatedContact, search);
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Contact
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(
          (contact) => contact.id !== action.payload
        );
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Resend Contact
      .addCase(resendContact.fulfilled, (state, action) => {
        const { pendingId, savedContact } = action.payload;
        stateHelpers.updateResendedContact(state, pendingId, savedContact);
      })
      .addCase(resendContact.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Add Contact
      .addCase(addContact.fulfilled, (state, action) => {
        if (action.payload.isOffline) {
          state.contacts = action.payload.allSortedContacts;
          state.isOffline = true;
          state.page = 1;
          state.hasMore = action.payload.hasMore;
          state.totalPages = action.payload.totalPages;
        } else if (action.payload.contact) {
          const newContacts = [...state.contacts, action.payload.contact];
          state.contacts = contactHelpers.sortContacts(newContacts, state.sortBy, state.sortOrder);
        }
      })
      .addCase(addContact.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Avatar
      .addCase(updateAvatar.fulfilled, (state, action) => {
        // State will be updated via loadContacts after avatar update
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setSearch,
  setSort,
  clearContacts,
  addPendingContact,
  handleResendSuccess,
} = contactSlice.actions;

export default contactSlice.reducer;
