/**
 * MainPage Component
 * 
 * The main container component that manages the contact list and search functionality.
 * Features:
 * - Contact list display with infinite scrolling
 * - Search and sort functionality
 * - Session storage for search/sort preferences
 * - Error handling
 */

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// Components
import SearchBar from "./SearchBar";
import ContactList from "./ContactList";
// Redux actions
import { updateSearch, updateSort, setContacts, clearContacts } from "../redux/contactActions";
import { loadContacts, editContact, deleteContact } from "../redux/contactThunks";
// Selectors
import {
  selectContacts,
  selectLoading,
  selectError,
  selectHasMore,
  selectSearch,
  selectIsOffline,
  selectSortBy,
  selectSortOrder
} from "../redux/contactReducer";

const MainPage = () => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state using selectors
  const contacts = useSelector(selectContacts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const hasMore = useSelector(selectHasMore);
  const search = useSelector(selectSearch);
  const isOffline = useSelector(selectIsOffline);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);

  /**
   * Load contacts when search or sort parameters change
   */
  useEffect(() => {
    dispatch(loadContacts(false));
  }, [sortBy, sortOrder, search, dispatch]);

  /**
   * Manage search parameters in session storage
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionParams = ["search", "sortBy", "sortOrder"];

    sessionParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        const storageKey = `contact${param[0].toUpperCase() + param.slice(1)}`;
        sessionStorage.setItem(storageKey, value);
        
        if (param === "search") {
          sessionStorage.setItem("searchActive", "true");
        }
      }
    });
  }, [location.search]);

  /**
   * Clean up session storage on page unload
   */
  useEffect(() => {
    const cleanupStorage = () => {
      sessionStorage.removeItem("searchActive");
      sessionStorage.removeItem("contactSearch");
    };

    window.addEventListener("beforeunload", cleanupStorage);
    return () => window.removeEventListener("beforeunload", cleanupStorage);
  }, []);

  // Event handlers
  const handleSearchChange = (value) => {
    dispatch(updateSearch(value));
    if (value) {
      sessionStorage.setItem('contactSearch', value);
      sessionStorage.setItem('searchActive', 'true');
    } else {
      sessionStorage.removeItem('contactSearch');
      sessionStorage.removeItem('searchActive');
    }
  };

  const handleSortChange = (field, order) => {
    sessionStorage.setItem('contactSortBy', field);
    sessionStorage.setItem('contactSortOrder', order);
    dispatch(updateSort(field, order));
  };

  // Error handling
  if (error) {
    return (
      <div className="error" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="app">
      {/* Search and Sort Controls */}
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        onSort={handleSortChange}
        onAdd={() => navigate("/add")}
      />

      {/* Contact List */}
      <ContactList
        contacts={contacts}
        loading={loading}
        hasMore={hasMore && !isOffline}
        onLoadMore={() => dispatch(loadContacts(true))}
        onEdit={(id, contact) => dispatch(editContact(id, contact))}
        onDelete={(id) => dispatch(deleteContact(id))}
        onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}
        onResendSuccess={(pendingId, savedContact) => {
          const updatedContacts = contacts.map(contact =>
            contact.id === pendingId ? {
              ...savedContact,
              id: savedContact._id || savedContact.id,
              sent: true,
              status: undefined
            } : contact
          );
          dispatch(setContacts(updatedContacts));
        }}
        onRefreshContacts={() => {
          dispatch(clearContacts());
          dispatch(loadContacts(false));
        }}
      />

      {/* Loading Indicator */}
      {loading && (
        <div className="loading" role="status">
          Loading...
        </div>
      )}
    </div>
  );
};

export default MainPage;
