import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import ContactList from './components/ContactList';
import AddContact from './components/AddContact';
import AvatarUpload from './components/AvatarUpload'; // Import AvatarUpload component
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
      // Update the contact locally instead of refreshing the entire list
      const updatedContacts = contacts.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );
      setContacts(updatedContacts);
      refreshContacts();
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

  const handleSort = (sortBy, sortOrder) => {
    setSortBy(sortBy);
    setSortOrder(sortOrder);
  };

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <SearchBar
        value={search}
        onChange={setSearch}
        onSort={handleSort}
        onAdd={() => navigate('/add')}
      />
      <ContactList
        contacts={contacts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAvatarUpdate={refreshContacts}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
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
        <Route path="/update-avatar/:id" element={<AvatarUpload />} />
      </Routes>
    </Router>
  );
};

export default App;