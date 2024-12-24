// Mengimpor modul dan komponen yang diperlukan
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import ContactList from './components/ContactList';
import AddContact from './components/AddContact';
import AvatarUpload from './components/AvatarUpload';
import { useContacts } from './hooks/useContacts';
import { api } from './services/api';
import './styles/styles.css';

// Komponen utama untuk halaman utama
const MainPage = () => {
  // Menggunakan hook useNavigate untuk navigasi
  const navigate = useNavigate();
  
  // Menggunakan custom hook useContacts untuk mengelola state kontak
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

  // Fungsi untuk mengedit kontak
  const handleEdit = async (id, updatedContact) => {
    try {
      // Memanggil API untuk memperbarui kontak
      await api.updateContact(id, updatedContact);
      
      // Cek apakah sedang dalam mode pencarian
      if (search) {
        // Cek apakah kontak yang diupdate masih sesuai dengan kriteria pencarian
        const searchLower = search.toLowerCase();
        const isStillMatching = 
          updatedContact.name.toLowerCase().includes(searchLower) ||
          updatedContact.phone.toLowerCase().includes(searchLower);

        if (!isStillMatching) {
          // Jika tidak match, hapus dari daftar yang ditampilkan
          setContacts(contacts.filter(contact => contact.id !== id));
          return;
        }
      }

      // Jika tidak dalam mode pencarian atau masih match, update seperti biasa
      const updatedContacts = contacts.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );
      setContacts(updatedContacts);
      refreshContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  // Fungsi untuk menghapus kontak
  const handleDelete = async (id) => {
    if (!id) {
      console.error('No contact ID provided for deletion');
      return;
    }
    
    try {
      // Memanggil API untuk menghapus kontak
      await api.deleteContact(id);
      // Merefresh daftar kontak setelah penghapusan
      refreshContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  // Fungsi untuk navigasi ke halaman update avatar
  const handleAvatarUpdate = (id) => {
    navigate(`/avatar/${id}`);
  };

  // Fungsi untuk menangani pengurutan
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Fungsi untuk menangani pencarian
  const handleSearch = (value) => {
    setSearch(value);
    if (!value) {
      sessionStorage.removeItem('contactSearch');
    } else {
      sessionStorage.setItem('contactSearch', value);
      // Add flag to indicate this is not a browser refresh
      sessionStorage.setItem('searchActive', 'true');
    }
  };

  // Effect untuk mendeteksi refresh browser
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('contactSearch');
      sessionStorage.removeItem('searchActive');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Fungsi untuk navigasi ke halaman tambah kontak
  const handleAdd = () => {
    navigate('/add');
  };

  // Menampilkan pesan error jika terjadi kesalahan
  if (error) return <div className="error">Error: {error}</div>;

  // Render komponen utama
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

// Komponen utama App
const App = () => {
  // Fungsi untuk menambah kontak baru
  const handleAdd = async (contact) => {
    try {
      // Memanggil API untuk menambah kontak
      await api.addContact(contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  };

  // Render komponen App dengan routing
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

// Ekspor komponen App sebagai default
export default App;