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

  // Load contacts from API
  const fetchContacts = async (isLoadMore = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await api.getContacts(
        currentPage,
        10,
        sortBy,
        sortOrder,
        search
      );

      if (!Array.isArray(response.phonebooks)) {
        throw new Error("Invalid data from API");
      }

      if (isLoadMore) {
        setContacts((old) => [...old, ...response.phonebooks]);
      } else {
        setContacts(response.phonebooks);
      }

      setPage(currentPage);
      setHasMore(
        response.phonebooks.length > 0 && currentPage < response.pages
      );
    } catch (err) {
      setError(err.message);
      console.error("Failed to load contacts:", err);
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
    // Menerima data form (onEdit) baru dari EditContact
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
      setContacts(contacts.filter((contact) => contact.id !== id));
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  // Load initial contacts
  useEffect(() => {
    fetchContacts();
  }, [sortBy, sortOrder, search]); // eslint-disable-line

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
      />
      {loading && <p>Loading...</p>}
    </div>
  );
}
