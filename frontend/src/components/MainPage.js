import React, { useReducer, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import ContactList from "./ContactList";
import { api } from "../services/api";
import { contactReducer, ACTIONS } from "../hooks/Reducer";

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // State setup
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
  });

  // Load contacts from API
  const loadContacts = useCallback(
    async (loadMore = false) => {
      if (state.loading) return;

      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      try {
        const page = loadMore ? state.page + 1 : 1;
        const response = await api.getContacts(
          page,
          10,
          state.sortBy,
          state.sortOrder,
          state.search
        );

        if (Array.isArray(response.phonebooks)) {
          if (loadMore) {
            dispatch({
              type: ACTIONS.ADD_MORE_CONTACTS,
              payload: response.phonebooks,
            });
          } else {
            dispatch({
              type: ACTIONS.SET_CONTACTS,
              payload: response.phonebooks,
            });
          }

          dispatch({
            type: ACTIONS.SET_HAS_MORE,
            payload: page < response.pages,
          });
          dispatch({ type: ACTIONS.SET_PAGE, payload: page });
        }
      } catch (err) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
        console.error("Failed to load contacts:", err);
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    },
    [state.loading, state.page, state.sortBy, state.sortOrder, state.search]
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

  // Edit Contact
  const handleEdit = useCallback(
    async (id, updatedContact) => {
      try {
        await api.updateContact(id, updatedContact);
        let newContacts = state.contacts.map((contact) =>
          contact.id === id ? updatedContact : contact
        );

        if (state.search) {
          const match =
            updatedContact.name
              .toLowerCase()
              .includes(state.search.toLowerCase()) ||
            updatedContact.phone
              .toLowerCase()
              .includes(state.search.toLowerCase());
          if (!match) {
            newContacts = state.contacts.filter((contact) => contact.id !== id);
            dispatch({ type: ACTIONS.SET_CONTACTS, payload: newContacts });
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
      await api.deleteContact(id);
      dispatch({ type: ACTIONS.DELETE_CONTACT, payload: id });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      console.error("Failed to delete contact:", error);
    }
    dispatch({ type: ACTIONS.SET_CONTACTS, payload: state.contacts.filter((contact) => contact.id !== id) });
  }, [state.contacts]);

  // Load contacts when sort or search changes
  useEffect(() => {
    dispatch({ type: ACTIONS.CLEAR_CONTACTS });
    loadContacts(false);
  }, [state.sortBy, state.sortOrder, state.search]); // eslint-disable-line

  // Handle URL parameters
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

  // Clear Search on Page unload
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
        hasMore={state.hasMore}
        onLoadMore={() => loadContacts(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}
      />
      {state.loading && <div className="loading">Loading...</div>}
    </div>
  );
}
