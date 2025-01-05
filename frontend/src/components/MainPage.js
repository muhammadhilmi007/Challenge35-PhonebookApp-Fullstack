import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import ContactList from "./ContactList";
import { useContacts } from "../hooks/useContacts";
import {ACTIONS} from "../hooks/useContacts";
import { api } from "../services/api";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { contacts, loading, error, hasMore, search },
    handleSearch,
    handleSort,
    loadContacts,
    dispatch,
  } = useContacts();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    const sortBy = params.get("sortBy");
    const sortOrder = params.get("sortOrder");

    if (searchQuery) {
      sessionStorage.setItem("contactSearch", searchQuery);
      sessionStorage.setItem("searchActive", "true");
    }
    if (sortBy) {
      sessionStorage.setItem("contactSortBy", sortBy);
    }
    if (sortOrder) {
      sessionStorage.setItem("contactSortOrder", sortOrder);
    }
  }, [location.search]);

  const handleEdit = async (id, updatedContact) => {
    try {
      await api.updateContact(id, updatedContact);

      if (search) {
        const searchLower = search.toLowerCase();
        const isStillMatching =
          updatedContact.name.toLowerCase().includes(searchLower) ||
          updatedContact.phone.toLowerCase().includes(searchLower);

        if (!isStillMatching) {
          const filteredContacts = contacts.filter(
            (contact) => contact.id !== id
          );
          dispatch({ type: ACTIONS.SET_CONTACTS, payload: filteredContacts });
          return;
        }
      }

      const updatedContacts = contacts.map((contact) =>
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );
      dispatch({ type: ACTIONS.SET_CONTACTS, payload: updatedContacts });
      loadContacts(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("No contact ID provided for deletion");
      return;
    }

    try {
      await api.deleteContact(id);
      loadContacts(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleAvatarUpdate = (id) => {
    navigate(`/avatar/${id}`);
  };

  const handleAdd = () => {
    navigate("/add");
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <SearchBar
        value={search}
        onChange={handleSearch}
        onSort={handleSort}
        onAdd={handleAdd}
      />
      <ContactList
        contacts={contacts}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={() => loadContacts(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAvatarUpdate={handleAvatarUpdate}
      />
      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default MainPage;
