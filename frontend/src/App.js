// Core imports
import React, { useRef, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Provider, useDispatch, useSelector } from 'react-redux';

// Component imports
import SearchBar from "./components/SearchBar";
import ContactList from "./components/ContactList";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";

// Store and API imports
import { store } from './store';
import { api } from './services/api';
import { 
  deleteContact, 
  fetchContacts, 
  resetContacts, 
  setSearch, 
  setSort, 
  updateContact, 
  clearSearch 
} from "./store/contactsSlice";

// Styles
import "./styles/styles.css";

// Constants
const CONTACTS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

// Selector functions
const selectContacts = state => state.contacts.contacts;
const selectLoading = state => state.contacts.loading;
const selectError = state => state.contacts.error;
const selectHasMore = state => state.contacts.hasMore;
const selectSearch = state => state.contacts.search;
const selectPage = state => state.contacts.page;
const selectSortBy = state => state.contacts.sortBy;
const selectSortOrder = state => state.contacts.sortOrder;

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchTimeout = useRef(null);

  // Use memoized selectors
  const contacts = useSelector(selectContacts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const hasMore = useSelector(selectHasMore);
  const search = useSelector(selectSearch);
  const page = useSelector(selectPage);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);

  // URL params handling
  const handleUrlParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    const sortByParam = params.get('sortBy');
    const sortOrderParam = params.get('sortOrder');

    if (searchQuery) {
      dispatch(setSearch(searchQuery));
      navigate(`/?search=${encodeURIComponent(searchQuery)}`, { replace: true });
    }
    if (sortByParam && sortOrderParam) {
      dispatch(setSort({ field: sortByParam, order: sortOrderParam }));
    }
  }, [location.search, dispatch, navigate]);

  React.useEffect(() => {
    handleUrlParams();
  }, [handleUrlParams]);

  // Data fetching
  const fetchContactsData = useCallback(() => {
    dispatch(fetchContacts({ 
      page: 1, 
      limit: CONTACTS_PER_PAGE, 
      sortBy,
      sortOrder,
      search 
    }));
  }, [dispatch, search, sortBy, sortOrder]);

  React.useEffect(() => {
    fetchContactsData();
  }, [fetchContactsData]);

  // Event handlers
  const handleSearch = useCallback((value) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      dispatch(setSearch(value));
      navigate(value ? `/?search=${encodeURIComponent(value)}` : '/', { replace: true });
    }, SEARCH_DEBOUNCE_MS);
  }, [dispatch, navigate]);

  const handleClearSearch = useCallback(() => {
    dispatch(clearSearch());
    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  const handleSort = useCallback((field, order) => {
    dispatch(setSort({ field, order }));
  }, [dispatch]);

  const handleEdit = useCallback(async (id, updatedContact) => {
    try {
      const resultAction = await dispatch(updateContact({ id, updatedContact })).unwrap();
      if (resultAction.shouldRemove || search) {
        dispatch(resetContacts());
        fetchContactsData();
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  }, [dispatch, search, fetchContactsData]);

  const handleDelete = useCallback(async (id) => {
    if (!id) return;
    try {
      await dispatch(deleteContact(id)).unwrap();
      dispatch(resetContacts());
      fetchContactsData();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  }, [dispatch, fetchContactsData]);

  const handleAvatarUpdate = useCallback((id) => {
    navigate(`/avatar/${id}`);
  }, [navigate]);

  const handleAdd = useCallback(() => {
    navigate("/add");
  }, [navigate]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchContacts({
        page: page + 1,
        limit: CONTACTS_PER_PAGE,
        sortBy,
        sortOrder,
        search
      }));
    }
  }, [dispatch, loading, hasMore, page, sortBy, sortOrder, search]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <SearchBar
        value={search}
        onChange={handleSearch}
        onClear={handleClearSearch}
        onSort={handleSort}
        onAdd={handleAdd}
      />
      {search && contacts.length === 0 && !loading && (
        <div className="no-results">No contacts found for "{search}"</div>
      )}
      <ContactList
        contacts={contacts}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAvatarUpdate={handleAvatarUpdate}
      />
      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

const App = () => {
  const handleAdd = useCallback(async (contact) => {
    try {
      await api.addContact(contact);
    } catch (error) {
      console.error("Error adding contact:", error);
      throw error;
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/add" element={<AddContact onAdd={handleAdd} />} />
          <Route path="/avatar/:id" element={<AvatarUpload />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
