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
      const currentPage = loadMore ? page + 1 : 1;
      const { phonebooks, ...pagination } = await api.getContacts(currentPage, 10, sortBy, sortOrder, search);
      
      if (Array.isArray(phonebooks)) {
        if (loadMore) {
          // When loading more, only append new contacts if they don't already exist
          setContacts(prev => {
            const existingIds = new Set(prev.map(contact => contact.id));
            const newContacts = phonebooks.filter(contact => !existingIds.has(contact.id));
            return [...prev, ...newContacts];
          });
        } else {
          // When not loading more (initial load or filter change), replace all contacts
          setContacts(phonebooks);
        }
        
        setHasMore(currentPage < pagination.pages);
        setPage(currentPage);
        console.log('API Response UseContacts:', phonebooks);
        
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      setError(err.message || 'Error fetching contacts');
    } finally {
      setLoading(false);
    }
  }, [loading, page, sortBy, sortOrder, search]);

  useEffect(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
    loadContacts(false); // Explicitly pass false for initial load
  }, [sortBy, sortOrder, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshContacts = useCallback(() => {
    setContacts([]);
    setPage(1);
    setHasMore(true);
    loadContacts(false); // Explicitly pass false for refresh
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
    setContacts,
    loadMore: () => loadContacts(true),
    refreshContacts
  };
};