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
import {
  loadContacts,
  updateContact,
  deleteContact,
  setSearch,
  setSort,
  handleResendSuccess,
  clearContacts
} from "../redux/contactSlice";

const MainPage = () => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const {
    contacts,
    loading,
    error,
    hasMore,
    search,
    sortBy,
    sortOrder,
    isOffline,
    page
  } = useSelector((state) => state.contacts);

  /**
   * Load contacts when search or sort parameters change
   */
  useEffect(() => {
    dispatch(loadContacts({ 
      page: 1,
      loadMore: false,
      sortBy,
      sortOrder,
      search
    }));
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
    dispatch(setSearch(value));
  };

  const handleSortChange = (field, order) => {
    dispatch(setSort({ sortBy: field, sortOrder: order }));
  };

  const handleEditContact = (id, updatedContact) => {
    dispatch(updateContact({ id, updatedContact }));
  };

  const handleDeleteContact = (id) => {
    dispatch(deleteContact(id));
  };

  const handleLoadMore = () => {
    if (isOffline) {
      const offlineContacts = JSON.parse(
        sessionStorage.getItem("offlineFilteredContacts") || "[]"
      );
      const startIndex = contacts.length;
      const endIndex = startIndex + 10;
      const nextBatch = offlineContacts.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        dispatch(loadContacts({
          loadMore: true,
          sortBy,
          sortOrder,
          search
        }));
      }
    } else {
      dispatch(loadContacts({
        page: page + 1,
        loadMore: true,
        sortBy,
        sortOrder,
        search
      }));
    }
  };

  const handleRefreshContacts = () => {
    dispatch(clearContacts());
    dispatch(loadContacts({
      page: 1,
      loadMore: false,
      sortBy,
      sortOrder,
      search
    }));
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
        onLoadMore={handleLoadMore}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}
        onResendSuccess={(pendingId, savedContact) => 
          dispatch(handleResendSuccess({ pendingId, savedContact }))}
        onRefreshContacts={handleRefreshContacts}
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
