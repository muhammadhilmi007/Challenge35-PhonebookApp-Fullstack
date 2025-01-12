import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import ContactList from "../components/ContactList";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import "../styles/styles.css";

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // States for contacts and pagination
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // States for search and sorting
  const [search, setSearch] = useState(
    sessionStorage.getItem("contactSearch") || ""
  );
  const [sortBy, setSortBy] = useState(
    sessionStorage.getItem("contactSortBy") || "name"
  );
  const [sortOrder, setSortOrder] = useState(
    sessionStorage.getItem("contactSortOrder") || "asc"
  );

  // States for online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load contacts from API
  const fetchContacts = async (isLoadMore = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await api.getContacts(
        currentPage,
        navigator.onLine ? 10 : Number.MAX_SAFE_INTEGER, // No limit when offline
        sortBy,
        sortOrder,
        search
      );

      const contactsData = response.data || [];
      if (!Array.isArray(contactsData)) {
        throw new Error("Invalid data from API");
      }

      if (isLoadMore) {
        setContacts((old) => [...old, ...contactsData]);
      } else {
        setContacts(contactsData);
      }

      setPage(currentPage);
      // Only enable infinite scroll when online
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

  // Handle search
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

  // Handle sorting
  const updateSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    sessionStorage.setItem("contactSortBy", field);
    sessionStorage.setItem("contactSortOrder", order);
    resetAndReload();
  };

  // Reset and reload contacts
  const resetAndReload = () => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
  };

  // Edit contact
  const editContact = async (id, updatedContact) => {
    try {
      await api.updateContact(id, updatedContact);
      let newContacts = contacts.map((contact) =>
        contact.id === id ? { ...contact, ...updatedContact } : contact
      );
      /*
        Mengubah Kontak yang Diperbarui:
Kode ini membuat array baru bernama newContacts dengan menggunakan metode map pada array contacts.
Untuk setiap contact dalam contacts, jika contact.id sama dengan id yang diberikan (yang menunjukkan kontak yang sedang diedit), maka objek kontak tersebut akan diperbarui dengan data baru dari updatedContact. Ini dilakukan dengan menggunakan spread operator (...) untuk menggabungkan properti dari contact yang ada dengan properti dari updatedContact.
Jika contact.id tidak sama dengan id, maka kontak tersebut akan tetap tidak berubah.
      */

      if (search) {
        const match =
          updatedContact.name.toLowerCase().includes(search.toLowerCase()) ||
          updatedContact.phone.toLowerCase().includes(search.toLowerCase());
        if (!match) {
          newContacts = contacts.filter((contact) => contact.id !== id);
        }
      }

      /*
        Pencarian dan Filter:
Jika ada nilai search (misalnya, kata kunci pencarian yang dimasukkan pengguna), kode ini akan memeriksa apakah nama atau nomor telepon dari updatedContact mengandung kata kunci pencarian tersebut.
Jika tidak ada kecocokan (!match), maka newContacts akan diperbarui untuk menghapus kontak yang baru saja diedit (dengan id yang sama). Ini dilakukan dengan menggunakan metode filter untuk membuat array baru yang hanya berisi kontak yang tidak memiliki id yang sama dengan kontak yang baru saja diedit.
      */

      setContacts(newContacts);
    } catch (err) {
      console.error("Failed to edit contact:", err);
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    try {
      await api.deleteContact(id);
      // Refresh the contacts list
      fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  // Handle resend
  const handleResend = async (pendingContact) => {
    try {
      setLoading(true);
      const response = await api.resendContact(pendingContact);
      if (response) {
        // Refresh the contact list
        fetchContacts();
      }
    } catch (error) {
      // Show user-friendly error message
      if (error.message.includes('Server sedang tidak aktif')) {
        alert('Server sedang tidak aktif. Silakan coba lagi nanti setelah server aktif kembali.');
      } else {
        alert('Gagal mengirim ulang kontak. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle online/offline state
  useEffect(() => {
    const handleOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setIsOnline(isOnline);
      // Refresh contacts when coming back online
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

  // Load initial contacts
  useEffect(() => {
    fetchContacts();
  }, [sortBy, sortOrder, search, isOnline]); // eslint-disable-line

  // Handle URL parameters
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

  // Clear search on page unload
  useEffect(() => {
    const cleanup = () => {
      sessionStorage.removeItem("contactSearch");
      sessionStorage.removeItem("searchActive");
    };
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

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
