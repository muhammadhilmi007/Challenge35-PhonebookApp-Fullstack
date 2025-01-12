import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import ContactList from "../components/ContactList";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import "../styles/styles.css";

/**
 * MainPage Component
 * 
 * Komponen utama untuk menampilkan dan mengelola daftar kontak.
 * Menyediakan fitur:
 * - Pencarian kontak
 * - Pengurutan kontak
 * - Penambahan kontak baru
 * - Edit dan hapus kontak
 * - Dukungan mode offline
 * - Infinite scroll untuk memuat lebih banyak kontak
 */
export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==================== State Management ====================
  
  /**
   * States untuk mengelola daftar kontak dan pagination
   */
  const [contacts, setContacts] = useState([]); // Daftar kontak
  const [loading, setLoading] = useState(false); // Status loading
  const [error, setError] = useState(null); // Pesan error jika ada
  const [page, setPage] = useState(1); // Halaman saat ini
  const [hasMore, setHasMore] = useState(true); // Masih ada data yang bisa dimuat

  /**
   * States untuk pencarian dan pengurutan
   */
  const [search, setSearch] = useState(
    sessionStorage.getItem("contactSearch") || ""
  );
  const [sortBy, setSortBy] = useState(
    sessionStorage.getItem("contactSortBy") || "name"
  );
  const [sortOrder, setSortOrder] = useState(
    sessionStorage.getItem("contactSortOrder") || "asc"
  );

  /**
   * State untuk status online/offline
   */
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ==================== Data Fetching ====================

  /**
   * Mengambil data kontak dari API
   * @param {boolean} isLoadMore - True jika memuat lebih banyak data (infinite scroll)
   */
  const fetchContacts = async (isLoadMore = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await api.getContacts(
        currentPage,
        navigator.onLine ? 10 : Number.MAX_SAFE_INTEGER,
        sortBy,
        sortOrder,
        search
      );

      const contactsData = response.data || [];
      if (!Array.isArray(contactsData)) {
        throw new Error("Invalid data from API");
      }

      setContacts((old) => isLoadMore ? [...old, ...contactsData] : contactsData);
      setPage(currentPage);
      setHasMore(navigator.onLine && contactsData.length > 0 && currentPage < response.totalPages);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load contacts:", err);
      setContacts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // ==================== Event Handlers ====================

  /**
   * Menangani perubahan pada pencarian
   * @param {string} value - Kata kunci pencarian
   */
  const updateSearch = (value) => {
    setSearch(value);
    if (value) {
      sessionStorage.setItem("contactSearch", value);
      sessionStorage.setItem("searchActive", "true");
    } else {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    }
    resetAndReload();
  };

  /**
   * Menangani perubahan pengurutan
   * @param {string} field - Field untuk pengurutan (name/phone)
   * @param {string} order - Urutan pengurutan (asc/desc)
   */
  const updateSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    sessionStorage.setItem("contactSortBy", field);
    sessionStorage.setItem("contactSortOrder", order);
    resetAndReload();
  };

  /**
   * Reset state dan memuat ulang kontak
   */
  const resetAndReload = () => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
  };

  // ==================== CRUD Operations ====================

  /**
   * Mengedit kontak yang ada
   * @param {string} id - ID kontak yang akan diedit
   * @param {Object} updatedContact - Data kontak yang diperbarui
   */
  const editContact = async (id, updatedContact) => {
    try {
      await api.updateContact(id, updatedContact);
      let newContacts = contacts.map((contact) =>
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );

      // Filter kontak jika tidak sesuai dengan pencarian
      if (search) {
        const match =
          updatedContact.name.toLowerCase().includes(search.toLowerCase()) ||
          updatedContact.phone.toLowerCase().includes(search.toLowerCase());
        if (!match) {
          newContacts = contacts.filter((contact) => contact.id !== id);
        }
      }

      setContacts(newContacts);
    } catch (err) {
      console.error("Failed to edit contact:", err);
    }
  };

  /**
   * Menghapus kontak
   * @param {string} id - ID kontak yang akan dihapus
   */
  const deleteContact = async (id) => {
    try {
      await api.deleteContact(id);
      fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  /**
   * Mengirim ulang kontak yang pending
   * @param {Object} pendingContact - Kontak yang akan dikirim ulang
   */
  const handleResend = async (pendingContact) => {
    try {
      setLoading(true);
      const response = await api.resendContact(pendingContact);
      if (response) {
        fetchContacts();
      }
    } catch (error) {
      if (error.message.includes('Server sedang tidak aktif')) {
        alert('Server sedang tidak aktif. Silakan coba lagi nanti setelah server aktif kembali.');
      } else {
        alert('Gagal mengirim ulang kontak. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== Effects ====================

  /**
   * Effect untuk menangani status online/offline
   */
  useEffect(() => {
    const handleOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setIsOnline(isOnline);
      if (isOnline) {
        setPage(1);
        fetchContacts();
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []); // eslint-disable-line

  /**
   * Effect untuk memuat kontak awal
   */
  useEffect(() => {
    fetchContacts();
  }, [sortBy, sortOrder, search, isOnline]); // eslint-disable-line

  /**
   * Effect untuk menangani parameter URL
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    ["search", "sortBy", "sortOrder"].forEach((param) => {
      const value = params.get(param);
      if (value) {
        sessionStorage.setItem(
          `contact${param.charAt(0).toUpperCase() + param.slice(1)}`,
          value
        );
        if (param === "search") {
          sessionStorage.setItem("searchActive", "true");
        }
      }
    });
  }, [location.search]);

  /**
   * Effect untuk membersihkan pencarian saat halaman ditutup
   */
  useEffect(() => {
    const cleanup = () => {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    };
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  // ==================== Render ====================

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="app">
      <SearchBar
        value={search}
        onChange={updateSearch}
        onSort={(field, order) => updateSort(field, order)}
        onAdd={() => navigate("/add")}
      />
      <ContactList
        contacts={contacts}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={() => fetchContacts(true)}
        onEdit={editContact}
        onDelete={deleteContact}
        onAvatarUpdate={(id) => navigate(`/avatar/${id}`)}
        onResend={handleResend}
      />
      {loading && <p>Loading...</p>}
      {!isOnline && <p>You are currently offline.</p>}
    </div>
  );
}
