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
// Components
import SearchBar from "./SearchBar";
import ContactList from "./ContactList";
// Context
import { useContactContext } from "../contexts/ContactContext";

const MainPage = () => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Contact context
  const { 
    state, 
    loadContacts,
    handleSearch,
    handleSort,
    handleEdit,
    handleDelete,
    handleResendSuccess,
    handleRefreshContacts
  } = useContactContext();

  /**
   * Load contacts when search or sort parameters change
   */
  useEffect(() => {
    loadContacts(false); // (false) berarti meminta data baru dan (true) berarti meminta data tambahan
  }, [state.sortBy, state.sortOrder, state.search]); // eslint-disable-line

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

  // Error handling
  if (state.error) {
    return (
      <div className="error" role="alert">
        Error: {state.error}
      </div>
    );
  }

  return (
    <div className="app">
      {/* Search and Sort Controls */}
      <SearchBar
        value={state.search}
        onChange={handleSearch}
        onSort={handleSort}
        onAdd={() => navigate("/add")}
      />

      {/* Contact List */}
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

      {/* Loading Indicator */}
      {state.loading && (
        <div className="loading" role="status">
          Loading...
        </div>
      )}
    </div>
  );
};

export default MainPage;
