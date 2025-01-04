import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

// Custom hook untuk mengelola state kontak
const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // 2.1 State untuk pengurutan (Inisialisasi State di useContacts Hook)
  const [sortBy, setSortBy] = useState(() => {
    return sessionStorage.getItem("contactSortBy") || "name";
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return sessionStorage.getItem("contactSortOrder") || "asc";
  });

  // 3.1 State untuk pencarian (State pencarian diinisialisasi dari sessionStorage)
  const [search, setSearch] = useState(() => {
    const savedSearch = sessionStorage.getItem("contactSearch");
    // 3.2 Memeriksa status aktif pencarian dari sessionStorage
    const isActive = sessionStorage.getItem("searchActive");
    return isActive === "true" ? savedSearch : "";
  });

  // 3.5 Memperbarui state pencarian, dan memanggil Handler untuk pencarian (Handler pencarian yang menggunakan useCallback)
  const handleSearch = useCallback((value) => {
    setSearch(value);
    // 3.6 Menyimpan nilai pencarian ke sessionStorage
    sessionStorage.setItem("contactSearch", value || "");
    // 3.7 Mengatur status pencarian aktif
    if (value) {
      sessionStorage.setItem("searchActive", "true");
    } else {
      sessionStorage.removeItem("searchActive");
    }
  }, []);

  // 2.2 Handler untuk pengurutan (Inisialisasi State di useContacts Hook)
  const handleSort = useCallback((field, order) => {
    sessionStorage.setItem("contactSortBy", field);
    sessionStorage.setItem("contactSortOrder", order);
    setPage(1);
    setContacts([]);
    setSortBy(field);
    setSortOrder(order);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("contactSearch", search);
    const fetchData = async () => {
      setContacts([]);
      setPage(1);
      setHasMore(true);
      await loadContacts(false);
    };

    fetchData();
  }, [sortBy, sortOrder, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadContacts = useCallback(
    async (loadMore = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const currentPage = loadMore ? page + 1 : 1;

        const { phonebooks, ...pagination } = await api.getContacts(
          currentPage,
          10,
          sortBy, // 2.8 API Call dengan parameter pengurutan, Backend melakukan pengurutan data, dan return data terurut
          sortOrder,
          search // 3.8 API Call dengan parameter pencarian, Backend melakukan pencarian data, dan mengembalikan hasil pencarian
        );

        if (Array.isArray(phonebooks)) {
          if (loadMore) {
            setContacts((prev) => {
              const existingIds = new Set(prev.map((contact) => contact.id));
              const newContacts = phonebooks.filter(
                (contact) => !existingIds.has(contact.id)
              ); // 3.9 Update contacts state dengan hasil pencarian
              return [...prev, ...newContacts];
            });
          } else {
            setContacts(phonebooks); // 2.9 Update contacts state dengan data terurut (Data Fetching)
          }

          setHasMore(currentPage < pagination.pages); // 2.10/3.10 Update pagination state
          setPage(currentPage); // 2.11/3.11 Trigger re-render, memicu pemuatan ulang kontak secara bertahap atau memuat kontak baru.
          console.log("API Response UseContacts:", phonebooks);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (err) {
        setError(err.message || "Error fetching contacts");
        console.log("Error loading contacts:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading, page, sortBy, sortOrder, search]
  );

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
      sessionStorage.setItem("contactSortOrder", order);
    },
    setContacts,
    loadMore: () => loadContacts(true),
    refreshContacts,
  };
};

export default useContacts;
