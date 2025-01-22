import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { api } from "../services/api";

// Initial state
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

// Async thunks
export const loadContacts = createAsyncThunk(
  "contacts/loadContacts",
  async (
    { loadMore, sortBy, sortOrder, search },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState().contacts;
      const page = loadMore ? state.page + 1 : 1;
      const limit = 10;

      // Get all stored contacts
      const pendingContacts = JSON.parse(
        sessionStorage.getItem("pendingContacts") || "[]"
      );
      const existingContacts = JSON.parse(
        sessionStorage.getItem("existingContacts") || "[]"
      );

      try {
        const response = await api.getContacts(
          page,
          limit,
          sortBy,
          sortOrder,
          search
        );

        if (Array.isArray(response.phonebooks)) {
          // Update existing contacts in session storage
          if (!loadMore) {
            sessionStorage.setItem(
              "existingContacts",
              JSON.stringify(response.phonebooks)
            );
          } else {
            const currentExisting = JSON.parse(
              sessionStorage.getItem("existingContacts") || "[]"
            );
            sessionStorage.setItem(
              "existingContacts",
              JSON.stringify([...currentExisting, ...response.phonebooks])
            );
          }

          // Combine and process contacts
          const allContacts = [...pendingContacts, ...response.phonebooks];
          const filteredContacts = filterContacts(allContacts, search);
          const sortedContacts = sortContacts(filteredContacts, sortBy, sortOrder);

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
          limit,
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
      updatePendingContacts(contact.id);
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
      const pendingContact = createPendingContact(contact);
      
      // Add to pending contacts
      addToPendingContacts(pendingContact);
      
      // Get all stored contacts
      const existingContacts = JSON.parse(
        sessionStorage.getItem("existingContacts") || "[]"
      );
      
      // Combine all contacts
      const allContacts = [pendingContact, ...existingContacts];
      
      // Filter and sort
      const filteredContacts = filterContacts(allContacts, state.search);
      const sortedContacts = sortContacts(filteredContacts, state.sortBy, state.sortOrder);
      
      // Store all contacts for offline mode
      sessionStorage.setItem(
        "offlineFilteredContacts",
        JSON.stringify(sortedContacts)
      );

      return {
        success: true,
        pendingContact,
        isOffline: true,
        allSortedContacts: sortedContacts,
        hasMore: sortedContacts.length > 10,
        totalPages: Math.ceil(sortedContacts.length / 10),
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

// Selectors
export const selectContacts = (state) => state.contacts.contacts;
export const selectSortBy = (state) => state.contacts.sortBy;
export const selectSortOrder = (state) => state.contacts.sortOrder;
export const selectSearch = (state) => state.contacts.search;

export const selectSortedAndFilteredContacts = createSelector(
  [selectContacts, selectSortBy, selectSortOrder, selectSearch],
  (contacts, sortBy, sortOrder, search) => {
    const sortedContacts = sortContacts(contacts, sortBy, sortOrder);
    return search ? filterContacts(sortedContacts, search) : sortedContacts;
  }
);

// Helper functions
function sortContacts(contacts, sortBy, sortOrder) {
  return [...contacts].sort((a, b) => {
    const aValue = (a[sortBy] || "").toString().toLowerCase();
    const bValue = (b[sortBy] || "").toString().toLowerCase();
    const compareResult = aValue.localeCompare(bValue);
    return sortOrder === "asc" ? compareResult : -compareResult;
  });
}

function filterContacts(contacts, search) {
  const searchTerm = search.toLowerCase();
  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.phone.toLowerCase().includes(searchTerm)
  );
}

function handleOfflineMode(
  pendingContacts,
  existingContacts,
  sortBy,
  sortOrder,
  search,
  loadMore,
  limit,
  page
) {
  // Get all contacts including previously stored offline contacts
  const offlineContacts = JSON.parse(
    sessionStorage.getItem("offlineFilteredContacts") || "[]"
  );
  
  // Combine all contacts
  const allContacts = [...pendingContacts, ...existingContacts];
  
  // Apply search filter if exists
  const filteredContacts = search ? 
    allContacts.filter(contact => 
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.toLowerCase().includes(search.toLowerCase())
    ) : allContacts;

  // Sort the filtered contacts
  const sortedContacts = sortContacts(filteredContacts, sortBy, sortOrder);
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  let currentBatch;

  if (loadMore) {
    // For infinite scroll, get the next batch from stored contacts
    currentBatch = offlineContacts.slice(startIndex, endIndex);
  } else {
    // For initial load, store the complete sorted list
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
}

function updateSearchStorage(search) {
  if (search) {
    sessionStorage.setItem("contactSearch", search);
    sessionStorage.setItem("searchActive", "true");
  } else {
    sessionStorage.removeItem("contactSearch");
    sessionStorage.removeItem("searchActive");
  }
}

function updateSortStorage(sortBy, sortOrder) {
  sessionStorage.setItem("contactSortBy", sortBy);
  sessionStorage.setItem("contactSortOrder", sortOrder);
}

function createPendingContact(contact) {
  return {
    ...contact,
    id: `pending_${Date.now()}`,
    status: "pending",
    sent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function addToPendingContacts(newContact) {
  const pendingContacts = JSON.parse(
    sessionStorage.getItem("pendingContacts") || "[]"
  );
  pendingContacts.unshift(newContact);
  sessionStorage.setItem("pendingContacts", JSON.stringify(pendingContacts));
}

function updatePendingContacts(id) {
  const pendingContacts = JSON.parse(
    sessionStorage.getItem("pendingContacts") || "[]"
  );
  const updatedPendingContacts = pendingContacts.filter((c) => c.id !== id);
  sessionStorage.setItem(
    "pendingContacts",
    JSON.stringify(updatedPendingContacts)
  );
}

function updateContactsState(state, data, loadMore) {
  if (loadMore && !state.isOffline) {
    const newContacts = data.filter(
      (newContact) =>
        !state.contacts.some((existing) => existing.id === newContact.id)
    );
    state.contacts = [
      ...state.contacts,
      ...sortContacts(newContacts, state.sortBy, state.sortOrder),
    ];
    state.page = state.page + 1;
  } else if (state.isOffline && loadMore) {
    // For offline mode, append new batch to existing contacts
    const startIndex = (state.page - 1) * 10;
    const endIndex = startIndex + 10;
    const offlineContacts = JSON.parse(
      sessionStorage.getItem("offlineFilteredContacts") || "[]"
    );
    const nextBatch = offlineContacts.slice(startIndex, endIndex);
    
    if (nextBatch.length > 0) {
      state.contacts = [...state.contacts, ...nextBatch];
      state.page = state.page + 1;
    }
  } else {
    state.contacts = sortContacts(data, state.sortBy, state.sortOrder);
    state.page = 1;
  }
}

function updatePaginationState(state, pages, hasMore) {
  state.hasMore = hasMore !== undefined ? hasMore : state.page < pages;
  state.totalPages = pages;
}

function updateContactInState(state, id, updatedContact, search) {
  if (search && !contactMatchesSearch(updatedContact, search)) {
    state.contacts = state.contacts.filter((contact) => contact.id !== id);
    return;
  }

  state.contacts = state.contacts.filter((contact) => contact.id !== id);
  state.contacts.push({ ...updatedContact, id });
  state.contacts = sortContacts(state.contacts, state.sortBy, state.sortOrder);
}

function contactMatchesSearch(contact, search) {
  const searchTerm = search.toLowerCase();
  return (
    contact.name.toLowerCase().includes(searchTerm) ||
    contact.phone.toLowerCase().includes(searchTerm)
  );
}

function updateResendedContact(state, pendingId, savedContact) {
  const index = state.contacts.findIndex((contact) => contact.id === pendingId);
  if (index !== -1) {
    state.contacts[index] = {
      ...savedContact,
      id: savedContact._id || savedContact.id,
      status: undefined,
    };
  }
}

// Contact slice
const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      updateSearchStorage(action.payload);
    },
    setSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
      state.page = 1;
      state.contacts = [];
      updateSortStorage(sortBy, sortOrder);
    },
    clearContacts: (state) => {
      state.contacts = [];
      state.page = 1;
      state.hasMore = true;
      state.isOffline = false;
    },
    addPendingContact: (state, action) => {
      const newContact = createPendingContact(action.payload);
      addToPendingContacts(newContact);
      state.contacts = sortContacts(
        [newContact, ...state.contacts],
        state.sortBy,
        state.sortOrder
      );
    },
    handleResendSuccess: (state, action) => {
      const { pendingId, savedContact } = action.payload;
      const index = state.contacts.findIndex(
        (contact) => contact.id === pendingId
      );
      if (index !== -1) {
        state.contacts[index] = {
          ...savedContact,
          id: savedContact._id || savedContact.id,
          sent: true,
          status: undefined,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadContacts.fulfilled, (state, action) => {
        const { data, pages, loadMore, isOffline, hasMore } = action.payload;
        updateContactsState(state, data, loadMore);
        updatePaginationState(state, pages, hasMore);
        state.loading = false;
        state.isOffline = isOffline;
        state.error = null;
      })
      .addCase(loadContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const { id, updatedContact, search } = action.payload;
        updateContactInState(state, id, updatedContact, search);
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(
          (contact) => contact.id !== action.payload
        );
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resendContact.fulfilled, (state, action) => {
        const { pendingId, savedContact } = action.payload;
        updateResendedContact(state, pendingId, savedContact);
      })
      .addCase(resendContact.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addContact.fulfilled, (state, action) => {
        if (action.payload.isOffline) {
          // Handle offline mode
          state.contacts = action.payload.allSortedContacts;
          state.isOffline = true;
          state.page = 1;
          state.hasMore = action.payload.hasMore;
          state.totalPages = action.payload.totalPages;
        } else if (action.payload.contact) {
          // Handle online mode
          const newContacts = [...state.contacts, action.payload.contact];
          state.contacts = sortContacts(newContacts, state.sortBy, state.sortOrder);
        }
      })
      .addCase(addContact.rejected, (state, action) => {
        state.error = action.payload;
      })
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
