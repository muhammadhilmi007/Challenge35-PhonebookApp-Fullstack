import React, { useReducer, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import ContactList from "./ContactList";
import { api } from "../services/api";
import { localStorageUtil } from "../services/localStorage";
import { contactReducer, ACTIONS } from "../hooks/Reducer";

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, dispatch] = useReducer(contactReducer, {
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
    isOffline: false
  });

  const loadContacts = useCallback(
    async (loadMore = false) => {
      if (state.loading) return;

      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      try {
        const page = loadMore ? state.page + 1 : 1;
        
        // Get pending contacts first
        const pendingContacts = localStorageUtil.getPendingContacts();
        
        try {
          // Try to get contacts from server with a large limit
          const response = await api.getContacts(
            page,
            100, // Increased limit for better offline support
            state.sortBy,
            state.sortOrder,
            state.search
          );

          if (Array.isArray(response.phonebooks)) {
            // Create a Set of existing IDs from pending contacts
            const existingIds = new Set(pendingContacts.map(contact => contact.id));
            
            // Filter out any server contacts that have matching IDs with pending contacts
            const uniqueServerContacts = response.phonebooks.filter(contact => {
              const isDuplicate = existingIds.has(contact.id.toString());
              if (!isDuplicate) {
                existingIds.add(contact.id.toString());
              }
              return !isDuplicate;
            });

            // Save ALL server contacts to localStorage for offline access
            localStorageUtil.saveAllContacts(uniqueServerContacts);

            // Combine contacts, ensuring pending contacts are first
            const allContacts = [...pendingContacts, ...uniqueServerContacts];

            if (loadMore) {
              const existingStateIds = new Set(state.contacts.map(c => c.id.toString()));
              const uniqueNewContacts = allContacts.filter(contact => 
                !existingStateIds.has(contact.id.toString())
              );
              
              dispatch({
                type: ACTIONS.SET_CONTACTS,
                payload: [...state.contacts, ...uniqueNewContacts],
              });
            } else {
              dispatch({
                type: ACTIONS.SET_CONTACTS,
                payload: allContacts,
              });
            }

            dispatch({
              type: ACTIONS.SET_HAS_MORE,
              payload: page < response.pages,
            });
            dispatch({ type: ACTIONS.SET_PAGE, payload: page });
            dispatch({ type: ACTIONS.SET_OFFLINE, payload: false });
          }
        } catch (error) {
          console.log("Server unavailable, loading from localStorage");
          // If server is not available, load ALL contacts from localStorage
          const offlineContacts = localStorageUtil.getAllContacts();
          
          // Create a Set of existing IDs from pending contacts
          const existingIds = new Set(pendingContacts.map(contact => contact.id));
          
          // Filter out any offline contacts that have matching IDs with pending contacts
          const uniqueOfflineContacts = offlineContacts.filter(contact => {
            const isDuplicate = existingIds.has(contact.id.toString());
            if (!isDuplicate) {
              existingIds.add(contact.id.toString());
            }
            return !isDuplicate;
          });

          // When offline, show all contacts at once
          if (loadMore && state.isOffline) {
            // Don't load more in offline mode, all data is already shown
            dispatch({ type: ACTIONS.SET_HAS_MORE, payload: false });
          } else {
            dispatch({
              type: ACTIONS.SET_CONTACTS,
              payload: [...pendingContacts, ...uniqueOfflineContacts],
            });
            dispatch({ type: ACTIONS.SET_HAS_MORE, payload: false });
            dispatch({ type: ACTIONS.SET_OFFLINE, payload: true });
          }
        }
      } catch (err) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        console.error("Failed to load contacts:", err);
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    },
    [state.loading, state.page, state.sortBy, state.sortOrder, state.search, state.contacts, state.isOffline]
  );

  // Handle search
  const handleSearch = useCallback((value) => {
    dispatch({ type: ACTIONS.UPDATE_SEARCH, payload: value });
    if (value) {
      sessionStorage.setItem("contactSearch", value);
      sessionStorage.setItem("searchActive", "true");
    } else {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    }
  }, []);

  // Handle sort
  const handleSort = useCallback((field, order) => {
    sessionStorage.setItem("contactSortBy", field);
    sessionStorage.setItem("contactSortOrder", order);
    dispatch({
      type: ACTIONS.UPDATE_SORT,
      payload: { sortBy: field, sortOrder: order },
    });
  }, []);

  // Handle resend success
  const handleResendSuccess = useCallback(
    async (pendingId, savedContact) => {
      const updatedContacts = state.contacts.map(contact =>
        contact.id === pendingId ? { ...savedContact, status: undefined } : contact
      );
      dispatch({ type: ACTIONS.SET_CONTACTS, payload: updatedContacts });
    },
    [state.contacts]
  );

  // Handle refresh contacts
  const handleRefreshContacts = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CONTACTS });
    loadContacts(false);
  }, [loadContacts]);

  const handleEdit = useCallback(
    async (id, updatedContact) => {
      try {
        // Find the current contact to get its photo
        const currentContact = state.contacts.find(c => c.id === id);
        
        // Prepare the update with the photo
        const contactToUpdate = {
          ...updatedContact,
          photo: currentContact?.photo || updatedContact.photo || null
        };

        await api.updateContact(id, contactToUpdate);
        
        let newContacts = state.contacts.map((contact) =>
          contact.id === id ? { ...contactToUpdate, id } : contact
        );

        if (state.search) {
          const match =
            contactToUpdate.name
              .toLowerCase()
              .includes(state.search.toLowerCase()) ||
            contactToUpdate.phone
              .toLowerCase()
              .includes(state.search.toLowerCase());
          if (!match) {
            newContacts = state.contacts.filter((contact) => contact.id !== id);
          }
        }
        dispatch({ type: ACTIONS.SET_CONTACTS, payload: newContacts });
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        console.error("Failed to update contact:", error);
      }
    },
    [state.contacts, state.search]
  );

  const handleDelete = useCallback(async (id) => {
    try {
      if (id && typeof id === 'string' && id.startsWith('pending_')) {
        localStorageUtil.removePendingContact(id);
      } else if (id) {
        await api.deleteContact(id);
      }
      dispatch({ 
        type: ACTIONS.SET_CONTACTS, 
        payload: state.contacts.filter((contact) => contact.id !== id) 
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      console.error("Failed to delete contact:", error);
    }
  }, [state.contacts]);

  useEffect(() => {
    dispatch({ type: ACTIONS.CLEAR_CONTACTS });
    loadContacts(false);
  }, [state.sortBy, state.sortOrder, state.search]); // eslint-disable-line

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    ["search", "sortBy", "sortOrder"].forEach((param) => {
      const value = params.get(param);
      if (value) {
        sessionStorage.setItem(`contact${param[0].toUpperCase() + param.slice(1)}`, value);
        if (param === "search") {
          sessionStorage.setItem("searchActive", "true");
        }
      }
    });
  }, [location.search]);

  useEffect(() => {
    const cleanup = () => {
      sessionStorage.removeItem("searchActive");
      sessionStorage.removeItem("contactSearch");
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

  if (state.error) {
    return <div className="error">Error: {state.error}</div>;
  }

  return (
    <div className="app">
      <SearchBar
        value={state.search}
        onChange={handleSearch}
        onSort={handleSort}
        onAdd={() => navigate("/add")}
      />
      <ContactList
        contacts={state.contacts}
        loading={state.loading}
        hasMore={state.hasMore && !state.isOffline}
        onLoadMore={() => loadContacts(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}
        onResendSuccess={handleResendSuccess}
        onRefreshContacts={handleRefreshContacts}
      />
      {state.loading && <div className="loading">Loading...</div>}
    </div>
  );
}
