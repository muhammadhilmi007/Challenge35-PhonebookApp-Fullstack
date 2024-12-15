import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');

  const loadContacts = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      const data = await api.getContacts(
        loadMore ? page + 1 : 1,
        5,
        sortBy,
        sortOrder,
        search
      );
      setContacts(prev => loadMore ? [...prev, ...data.phonebooks] : data.phonebooks);
      setHasMore(data.page < data.pages);
      setPage(loadMore ? p => p + 1 : 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search]);

  useEffect(() => {
    loadContacts();
  }, [sortBy, sortOrder, search, loadContacts]);

  const refreshContacts = useCallback(() => {
    setPage(1);
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    loading,
    error,
    hasMore,
    sortBy,
    sortOrder,
    search,
    setSearch,
    setSortBy,
    setSortOrder,
    loadMore: () => loadContacts(true),
    refreshContacts
  };
};