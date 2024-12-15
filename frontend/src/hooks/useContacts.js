import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');

  const loadContacts = useCallback(async (loadMore = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const newPage = loadMore ? page + 1 : 1;
      const data = await api.getContacts(newPage, 10, sortBy, sortOrder, search);
      
      setContacts(prev => loadMore ? [...prev, ...data.phonebooks] : data.phonebooks);
      setHasMore(data.page < data.pages);
      setPage(newPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, page, sortBy, sortOrder, search]);

  useEffect(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
    loadContacts();
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [sortBy, sortOrder, search]);

  const refreshContacts = useCallback(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
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