// Mengimpor modul dan komponen yang diperlukan
import React, { useReducer, useContext, createContext, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import SearchBar from "./components/SearchBar";
import ContactList from "./components/ContactList";
import AddContact from "./components/AddContact";
import AvatarUpload from "./components/AvatarUpload";
import { api } from "./services/api";
import "./styles/styles.css";

// Create Contact Context
const ContactContext = createContext();

// Initial state for reducer
const initialState = {
  contacts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  sortBy: sessionStorage.getItem('contactSortBy') || 'name',
  sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc',
  search: sessionStorage.getItem('searchActive') ? (sessionStorage.getItem('contactSearch') || '') : ''
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONTACTS: 'SET_CONTACTS',
  APPEND_CONTACTS: 'APPEND_CONTACTS',
  SET_PAGE: 'SET_PAGE',
  SET_HAS_MORE: 'SET_HAS_MORE',
  SET_SORT: 'SET_SORT',
  SET_SEARCH: 'SET_SEARCH',
  RESET_CONTACTS: 'RESET_CONTACTS'
};

// Reducer function
const contactReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_CONTACTS:
      return { ...state, contacts: action.payload };
    case ACTIONS.APPEND_CONTACTS:
      return { ...state, contacts: [...state.contacts, ...action.payload] };
    case ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };
    case ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };
    case ACTIONS.SET_SORT:
      return { 
        ...state, 
        sortBy: action.payload.sortBy, 
        sortOrder: action.payload.sortOrder,
        page: 1,
        contacts: [] 
      };
    case ACTIONS.SET_SEARCH:
      return { ...state, search: action.payload };
    case ACTIONS.RESET_CONTACTS:
      return { 
        ...state, 
        contacts: [], 
        page: 1, 
        hasMore: true 
      };
    default:
      return state;
  }
};

// Contact Provider Component
const ContactProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  const loadContacts = useCallback(async (loadMore = false) => {
    if (state.loading) return;

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    
    try {
      const currentPage = loadMore ? state.page + 1 : 1;
      
      const { phonebooks, ...pagination } = await api.getContacts(
        currentPage,
        10,
        state.sortBy,
        state.sortOrder,
        state.search
      );

      if (Array.isArray(phonebooks)) {
        if (loadMore) {
          const existingIds = new Set(state.contacts.map(contact => contact.id));
          const newContacts = phonebooks.filter(contact => !existingIds.has(contact.id));
          dispatch({ type: ACTIONS.APPEND_CONTACTS, payload: newContacts });
        } else {
          dispatch({ type: ACTIONS.SET_CONTACTS, payload: phonebooks });
        }
        
        dispatch({ type: ACTIONS.SET_HAS_MORE, payload: currentPage < pagination.pages });
        dispatch({ type: ACTIONS.SET_PAGE, payload: currentPage });
        console.log('API Response UseContacts:', phonebooks);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Error fetching contacts' });
      console.error('Error loading contacts:', err);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.loading, state.page, state.sortBy, state.sortOrder, state.search]);

  const handleSearch = useCallback((value) => {
    dispatch({ type: ACTIONS.SET_SEARCH, payload: value });
    sessionStorage.setItem('contactSearch', value || '');
    if (value) {
      sessionStorage.setItem('searchActive', 'true');
    } else {
      sessionStorage.removeItem('searchActive');
    }
  }, []);

  const handleSort = useCallback((field, order) => {
    sessionStorage.setItem('contactSortBy', field);
    sessionStorage.setItem('contactSortOrder', order);
    dispatch({ 
      type: ACTIONS.SET_SORT, 
      payload: { sortBy: field, sortOrder: order } 
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem('contactSearch', state.search);
  }, [state.search]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: ACTIONS.RESET_CONTACTS });
      await loadContacts(false);
    };
    
    fetchData();
  }, [state.sortBy, state.sortOrder, state.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    state,
    dispatch,
    loadContacts,
    handleSearch,
    handleSort
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

// Custom hook to use contact context
const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    state: { contacts, loading, error, hasMore, search },
    handleSearch,
    handleSort,
    loadContacts,
    dispatch
  } = useContacts();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    const sortBy = params.get('sortBy');
    const sortOrder = params.get('sortOrder');

    if (searchQuery) {
      sessionStorage.setItem('contactSearch', searchQuery);
      sessionStorage.setItem('searchActive', 'true');
    }
    if (sortBy) {
      sessionStorage.setItem('contactSortBy', sortBy);
    }
    if (sortOrder) {
      sessionStorage.setItem('contactSortOrder', sortOrder);
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
          const filteredContacts = contacts.filter((contact) => contact.id !== id);
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

// Wrapper component for routes that need contact context
const AppRoutes = () => {
  const { loadContacts } = useContacts();

  const handleAdd = async (contact) => {
    try {
      await api.addContact(contact);
      // Refresh contacts after adding new contact
      loadContacts(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      throw error;
    }
  };

  const handleAvatarUpdate = async () => {
    // Refresh contacts after avatar update
    await loadContacts(false);
  };

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/add" element={<AddContact onAdd={handleAdd} />} />
      <Route path="/avatar/:id" element={<AvatarUpload onAvatarUpdate={handleAvatarUpdate} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ContactProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ContactProvider>
  );
};

export default App;
