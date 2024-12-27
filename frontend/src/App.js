// Mengimpor modul dan komponen yang diperlukan
import React, { useState, useEffect, useCallback } from "react";
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

// Custom hook untuk mengelola state kontak
const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState(() => {
    return sessionStorage.getItem('contactSortBy') || 'name';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return sessionStorage.getItem('contactSortOrder') || 'asc';
  });
  const [search, setSearch] = useState(() => {
    const savedSearch = sessionStorage.getItem('contactSearch');
    const isActive = sessionStorage.getItem('searchActive');
    return isActive ? (savedSearch || '') : '';
  });

  const handleSearch = useCallback((value) => {
    setSearch(value);
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
    setPage(1);
    setContacts([]);
    setSortBy(field);
    setSortOrder(order);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('contactSearch', search);
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      setContacts([]);
      setPage(1);
      setHasMore(true);
      await loadContacts(false);
    };
    
    fetchData();
  }, [sortBy, sortOrder, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadContacts = useCallback(async (loadMore = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    
    try {
      const currentPage = loadMore ? page + 1 : 1;
      
      const { phonebooks, ...pagination } = await api.getContacts(
        currentPage, 
        10, 
        sortBy, 
        sortOrder, 
        search
      );

      if (Array.isArray(phonebooks)) {
        if (loadMore) {
          setContacts(prev => {
            const existingIds = new Set(prev.map(contact => contact.id));
            const newContacts = phonebooks.filter(contact => !existingIds.has(contact.id));
            return [...prev, ...newContacts];
          });
        } else {
          setContacts(phonebooks);
        }
        
        setHasMore(currentPage < pagination.pages);
        setPage(currentPage);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      setError(err.message || 'Error fetching contacts');
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, page, sortBy, sortOrder, search]);

  const refreshContacts = useCallback(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
    loadContacts(false);
  }, [loadContacts]);

  return {
    contacts,
    loading,
    error,
    hasMore,
    sortBy,
    sortOrder,
    search,
    setSearch: handleSearch,
    setSortBy: handleSort,
    setSortOrder: (order) => {
      setSortOrder(order);
      sessionStorage.setItem('contactSortOrder', order);
    },
    setContacts,
    loadMore: () => loadContacts(true),
    refreshContacts
  };
};

// Komponen utama untuk halaman utama
const MainPage = () => {
  // Menggunakan hook useNavigate untuk navigasi
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL parameters on component mount
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
    setContacts,
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
          setContacts(contacts.filter((contact) => contact.id !== id));
          return;
        }
      }

      // Jika tidak dalam mode pencarian atau masih match, update seperti biasa
      const updatedContacts = contacts.map((contact) =>
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );
      refreshContacts();
      setContacts(updatedContacts);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  // Fungsi untuk menghapus kontak
  const handleDelete = async (id) => {
    if (!id) {
      console.error("No contact ID provided for deletion");
      return;
    }

    try {
      // Memanggil API untuk menghapus kontak
      await api.deleteContact(id);
      // Merefresh daftar kontak setelah penghapusan
      refreshContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
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
      sessionStorage.removeItem("contactSearch");
    } else {
      sessionStorage.setItem("contactSearch", value);
      // Add flag to indicate this is not a browser refresh
      sessionStorage.setItem("searchActive", "true");
    }
  };

  // Effect untuk mendeteksi refresh browser
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Fungsi untuk navigasi ke halaman tambah kontak
  const handleAdd = () => {
    navigate("/add");
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
      console.error("Error adding contact:", error);
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

/*
Penjelasan, Alur, dan Logika:

1. Struktur Aplikasi:
   - Aplikasi ini adalah sebuah aplikasi manajemen kontak yang dibangun menggunakan React.
   - Terdiri dari beberapa komponen utama: MainPage, AddContact, dan AvatarUpload.
   - Menggunakan React Router untuk navigasi antar halaman.

2. Komponen MainPage:
   - Merupakan halaman utama yang menampilkan daftar kontak.
   - Menggunakan custom hook 'useContacts' untuk mengelola state dan operasi terkait kontak.
   - Menyediakan fitur pencarian, pengurutan, dan infinite scrolling untuk daftar kontak.
   - Memungkinkan pengguna untuk mengedit, menghapus, dan memperbarui avatar kontak.

3. Manajemen State:
   - Menggunakan custom hook 'useContacts' untuk centralized state management.
   - State meliputi daftar kontak, status loading, error, pencarian, dan pengurutan.

4. Interaksi dengan Backend:
   - Menggunakan modul 'api' untuk berkomunikasi dengan backend.
   - Operasi CRUD (Create, Read, Update, Delete) pada kontak dilakukan melalui API calls.
   - Pencarian dan pengurutan dilakukan di sisi client untuk responsivitas yang lebih baik.

5. Fitur Pencarian:
   - Pencarian real-time pada daftar kontak.
   - Hasil pencarian disimpan di sessionStorage untuk persistensi selama sesi.

6. Penanganan Avatar:
   - Fitur khusus untuk memperbarui avatar kontak melalui halaman terpisah.

7. Routing:
   - Menggunakan React Router untuk navigasi antar halaman tanpa refresh penuh.
   - Terdapat rute untuk halaman utama, tambah kontak, dan update avatar.

8. Optimasi Performa:
   - Implementasi infinite scrolling untuk memuat kontak secara bertahap.
   - Pencarian dan pengurutan dilakukan secara lokal untuk UX yang lebih responsif.

Alur Aplikasi:
1. Aplikasi dimulai dengan merender komponen App.
2. Pengguna diarahkan ke halaman utama (MainPage) yang menampilkan daftar kontak.
3. Pengguna dapat melakukan pencarian, pengurutan, atau scroll untuk memuat lebih banyak kontak.
4. Untuk menambah kontak baru, pengguna diarahkan ke halaman AddContact.
5. Untuk mengedit atau menghapus kontak, pengguna dapat melakukannya langsung dari daftar kontak.
6. Untuk memperbarui avatar, pengguna diarahkan ke halaman AvatarUpload.

Keterhubungan dengan Backend:
1. API Calls:
   - Semua operasi CRUD menggunakan fungsi dari modul 'api' yang berkomunikasi dengan backend.
   - Operasi GET untuk mengambil daftar kontak dan detil kontak.
   - Operasi POST untuk menambah kontak baru.
   - Operasi PUT/PATCH untuk memperbarui kontak yang ada.
   - Operasi DELETE untuk menghapus kontak.

2. Manajemen State:
   - State lokal di-sync dengan data dari backend melalui API calls.
   - Perubahan pada frontend (seperti edit atau hapus) langsung dikirim ke backend.

3. Error Handling:
   - Kesalahan dari backend ditangkap dan ditampilkan ke pengguna.
   - Menggunakan try-catch untuk menangani error pada setiap operasi API.

4. Optimasi:
   - Implementasi infinite scrolling untuk mengurangi beban pada backend dengan memuat data secara bertahap.
   - Pencarian dan pengurutan dilakukan di sisi client untuk mengurangi beban server, dengan asumsi jumlah data tidak terlalu besar.

Aplikasi ini mendemonstrasikan penggunaan React modern dengan hooks, custom hooks untuk manajemen state, dan integrasi yang baik dengan backend melalui API. Struktur dan organisasi kode memungkinkan untuk skalabilitas dan pemeliharaan yang mudah.
*/
