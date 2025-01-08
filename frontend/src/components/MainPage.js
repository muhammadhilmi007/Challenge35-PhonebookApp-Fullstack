import { useEffect } from "react";
import SearchBar from "../components/SearchBar";
import ContactList from "../components/ContactList";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import "../styles/styles.css";
import { useState } from "react";

const useContacts = () => {
  // Basic states
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get saved preferences from session storage
  const [search, setSearch] = useState(sessionStorage.getItem("contactSearch") || "");
  const [sortBy, setSortBy] = useState(sessionStorage.getItem("contactSortBy") || "name");
  const [sortOrder, setSortOrder] = useState(sessionStorage.getItem("contactSortOrder") || "asc");

  // Load contacts from API
  async function fetchContacts(isLoadMore = false) {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await api.getContacts(currentPage, 10, sortBy, sortOrder, search);

      if (!Array.isArray(response.phonebooks)) {
        throw new Error("Invalid data from API");
      }

      if (isLoadMore) {
        setContacts(old => [...old, ...response.phonebooks]);
      } else {
        setContacts(response.phonebooks);
      }

      setPage(currentPage);
      setHasMore(response.phonebooks.length > 0 && currentPage < response.pages);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle search
  function updateSearch(value) {
    setSearch(value);
    sessionStorage.setItem("contactSearch", value);
    resetAndReload();
  }

  // Handle sorting
  function updateSort(field, order) {
    sessionStorage.setItem("contactSortBy", field);
    sessionStorage.setItem("contactSortOrder", order);
    setSortBy(field);
    setSortOrder(order);
    resetAndReload();
  }

  // Reset pagination and reload contacts
  function resetAndReload() {
    setContacts([]);
    setPage(1);
    setHasMore(true);
  }

  // Load initial contacts
  useEffect(() => {
    fetchContacts();
  }, [sortBy, sortOrder, search]); //eslint-disable-line

  return {
    // States
    contacts,
    loading,
    error,
    hasMore,
    search,
    sortBy,
    sortOrder,

    // Actions
    setSearch: updateSearch,
    setSortBy: updateSort,
    setSortOrder: order => updateSort(sortBy, order),
    setContacts,
    loadMore: () => fetchContacts(true),
    refreshContacts: () => fetchContacts()
  };
}

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    contacts, loading, error, hasMore, search, 
    setSearch, setSortBy, setSortOrder, loadMore, 
    refreshContacts, setContacts 
  } = useContacts();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    ["search", "sortBy", "sortOrder"].forEach(param => {
      const value = params.get(param);
      if (value) {
        sessionStorage.setItem(`contact${param.charAt(0).toUpperCase() + param.slice(1)}`, value);
        param === "search" && sessionStorage.setItem("searchActive", "true");
      }
    });
  }, [location.search]);

  useEffect(() => {
    const cleanup = () => {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    };
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  const updateSearch = value => {
    setSearch(value);
    value ? sessionStorage.setItem("contactSearch", value) && sessionStorage.setItem("searchActive", "true")
          : sessionStorage.removeItem("contactSearch");
  };

  const editContact = async (id, updatedContact) => {
    try {
      await api.updateContact(id, updatedContact);
      let newContacts = contacts.map(c => c.id === id ? { ...c, ...updatedContact } : c);
      
      if (search) {
        const match = updatedContact.name.toLowerCase().includes(search.toLowerCase()) ||
                     updatedContact.phone.toLowerCase().includes(search.toLowerCase());
        if (!match) newContacts = contacts.filter(c => c.id !== id);
      }
      
      setContacts(newContacts);
    } catch (e) {
      console.error("Edit failed:", e);
    }
  };

  const deleteContact = async id => {
    try {
      await api.deleteContact(id);
      const newContacts = contacts.filter(c => c.id !== id);
      refreshContacts(newContacts);
      setContacts(newContacts);
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <SearchBar
        value={search}
        onChange={updateSearch}
        onSort={(field, order) => { setSortBy(field); setSortOrder(order); }}
        onAdd={() => navigate("/add")}
      />
      <ContactList
        contacts={contacts}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onEdit={editContact}
        onDelete={deleteContact}
        onAvatarUpdate={id => navigate(`/avatar/${id}`)}
      />
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default MainPage;
