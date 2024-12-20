import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import ContactList from './components/ContactList';
import AddContact from './components/AddContact';
import AvatarUpload from './components/AvatarUpload';
import { useContacts } from './hooks/useContacts';
import { api } from './services/api';
import './styles/styles.css';

const MainPage = () => {
  const navigate = useNavigate();
  const {
    contacts,
    loading,
    error,
    hasMore,
    search,
    setSearch,
    setSortBy,
    setSortOrder,
    loadMore,
    refreshContacts,
    setContacts
  } = useContacts();

  const handleEdit = async (id, updatedContact) => {
    try {
      await api.updateContact(id, updatedContact);
      const updatedContacts = contacts.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );
      setContacts(updatedContacts);
      //refreshContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error('No contact ID provided for deletion');
      return;
    }
    
    try {
      await api.deleteContact(id);
      refreshContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleAvatarUpdate = (id) => {
    navigate(`/avatar/${id}`);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleAdd = () => {
    navigate('/add');
  };

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
  const handleAdd = async (contact) => {
    try {
      await api.addContact(contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddContact onAdd={handleAdd} />} />
        <Route path="/avatar/:id" element={<AvatarUpload />} />
      </Routes>
    </Router>
  );
};

export default App;