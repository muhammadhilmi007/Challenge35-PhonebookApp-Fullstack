import { useEffect } from "react";
import SearchBar from "../components/SearchBar";
import ContactList from "../components/ContactList";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import useContacts from "../hooks/useContacts";
import "../styles/styles.css";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    setContacts,
  } = useContacts();

  // Fungsi untuk menangani pencarian
  const handleSearch = (value) => {
    setSearch(value);
    if (!value) {
      sessionStorage.removeItem("contactSearch");
    } else {
      sessionStorage.setItem("contactSearch", value);
      // Add flag to indicate this is not a browser refresh
      sessionStorage.setItem("searchActive", "true");
    }
  };

  // Effect untuk mendeteksi refresh browser
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

  // Fungsi untuk menangani pengurutan
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Fungsi untuk navigasi ke halaman tambah kontak
  const handleAdd = () => {
    navigate("/add");
  };

  const handleEdit = async (id, updatedContact) => {
    try {
      // 4.9 Memanggil API untuk memperbarui kontak
      await api.updateContact(id, updatedContact);

      // !! Update Contact dalam mode search dan sort.
      // Cek apakah sedang dalam mode pencarian
      if (search) {
        // Cek apakah kontak yang diupdate masih sesuai dengan kriteria pencarian
        const searchLower = search.toLowerCase();
        const isStillMatching =
          updatedContact.name.toLowerCase().includes(searchLower) ||
          updatedContact.phone.toLowerCase().includes(searchLower);

        if (!isStillMatching) {
          const updatedContacts = contacts.filter(
            (contact) => contact.id !== id
          );
          // Jika tidak match, hapus dari daftar yang ditampilkan
          setContacts(updatedContacts);
          return;
        }
      }

      // Jika tidak dalam mode pencarian atau masih match, update seperti biasa
      const updatedContacts = contacts.map(
        (
          contact // 4.10 Memperbarui state contacts setelah edit berhasil
        ) => (contact.id === id ? { ...contact, ...updatedContact } : contact)
      );
      // 4.11 Memperbarui UI dengan data terbaru
      refreshContacts(updatedContacts);
      setContacts(updatedContacts);
    } catch (error) {
      console.log("Error updating contact:", error);
    }
  };

  // Fungsi untuk menghapus kontak
  const handleDelete = async (id) => {
    try {
      // Memanggil API untuk menghapus kontak
      await api.deleteContact(id);
      const updatedContacts = contacts.filter((contact) => contact.id !== id);
      // Merefresh daftar kontak setelah penghapusan
      refreshContacts(updatedContacts);
      setContacts(updatedContacts);
    } catch (error) {
      console.log("Error deleting contact:", error);
    }
  };

  // Fungsi untuk navigasi ke halaman update avatar
  const handleAvatarUpdate = (id) => {
    navigate(`/avatar/${id}`);
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
      {/* 1.4 Meneruskan data dan callback ke ContactList */}
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
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default MainPage;
