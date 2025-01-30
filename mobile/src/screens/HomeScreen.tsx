import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSortAlphaDown, faSortAlphaUp, faUserPlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import { useContacts, useDebounce } from '../hooks/useContacts';
import { useFocusEffect } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../types/index';
import { Contact } from '../types';
import contactHelpers from '../helpers/contactHelpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 95;
const ICON_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.06, 24), 32);
const ITEMS_PER_PAGE = 10;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface ContactsResponse {
  phonebooks: Contact[];
  total: number;
  page: number;
  pages: number;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [editingContactIds, setEditingContactIds] = useState<Set<string>>(new Set());
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>('');

  const debouncedSearch = useDebounce<string>((value) => {
    setDebouncedSearchValue(value);
  });

  // Update debounced search value
  useEffect(() => {
    debouncedSearch(search);
  }, [search]);

  const {
    contacts,
    loading,
    error,
    isOffline,
    fetchContacts,
    handleDeleteContact,
    handleResendContact,
    handleUpdateContact,
  } = useContacts();

  // Initialize contacts and handle screen focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          if (!isInitialized) {
            await fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
            setIsInitialized(true);
          }
        } catch (err) {
          console.error('Error loading contacts:', err);
          if (!isInitialized) {
            setIsInitialized(true);
          }
        }
      };

      loadData();
    }, [isInitialized, fetchContacts, debouncedSearchValue, sortOrder])
  );

  // Effect for handling search and sort changes
  useEffect(() => {
    if (isInitialized) {
      setPage(1);
      setHasMoreData(true);
      fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
    }
  }, [debouncedSearchValue, sortOrder, isInitialized]);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent): boolean => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (
      isLoadingMore || 
      loading || 
      !contacts || 
      !contacts.phonebooks || 
      !hasMoreData ||
      contacts.page >= contacts.pages
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      await fetchContacts(nextPage, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
      setPage(nextPage);
      
      // Check if we have more data
      if (nextPage >= contacts.pages) {
        setHasMoreData(false);
      }
    } catch (err) {
      console.error('Error loading more contacts:', err);
      if (!isOffline) {
        setHasMoreData(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, loading, contacts, hasMoreData, page, fetchContacts, sortOrder, debouncedSearchValue, isOffline]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    if (isCloseToBottom(event.nativeEvent)) {
      handleLoadMore();
    }
  }, [isCloseToBottom, handleLoadMore]);

  const handleSortToggle = useCallback((): void => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const handleStartEditing = (contactId: string) => {
    setEditingContactIds(prev => new Set([...prev, contactId]));
  };

  const handleStopEditing = (contactId: string) => {
    setEditingContactIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(contactId);
      return newSet;
    });
  };

  const contactMatchesSearch = useCallback((contact: Contact, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(term) ||
      contact.phone.toLowerCase().includes(term)
    );
  }, []);

  const handleEditContact = async (contact: Contact) => {
    try {
      // Keep a local copy of the edited contact
      const editedContact = { ...contact };
      
      // Check if the edited contact still matches the search criteria
      const matchesSearch = contactMatchesSearch(editedContact, search);
      
      if (contacts && contacts.phonebooks) {
        if (matchesSearch) {
          // If it matches, update it in the current list and sort
          const filteredContacts = contacts.phonebooks.filter(c => c.id !== contact.id);
          const updatedPhonebooks = contactHelpers.sortContacts(
            [...filteredContacts, editedContact],
            sortOrder
          );
          contacts.phonebooks = updatedPhonebooks;
        } else {
          // If it doesn't match the search, remove it from the current view
          contacts.phonebooks = contacts.phonebooks.filter(c => c.id !== contact.id);
          // Update total count
          if (contacts.total > 0) {
            contacts.total -= 1;
          }
        }
      }

      // Make the API call
      const success = await handleUpdateContact(contact.id, {
        name: contact.name,
        phone: contact.phone,
      });
      
      if (success) {
        handleStopEditing(contact.id);
        // If the update was successful and the contact no longer matches search
        // we don't need to do anything else as it's already removed from view
      } else {
        // If update fails, revert the changes
        if (contacts && contacts.phonebooks) {
          if (contactMatchesSearch(contact, search)) {
            // Only revert if the original contact matched the search
            const filteredContacts = contacts.phonebooks.filter(c => c.id !== contact.id);
            const revertedPhonebooks = contactHelpers.sortContacts(
              [...filteredContacts, contact],
              sortOrder
            );
            contacts.phonebooks = revertedPhonebooks;
            // Restore total if it was decremented
            if (!matchesSearch) {
              contacts.total += 1;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', 'Failed to update contact');
    }
  };

  const handleAvatarPress = (contact: Contact): void => {
    navigation.navigate('Avatar', { contact });
  };

  const renderContactList = useCallback(() => {
    if (!contacts?.phonebooks?.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {search ? 'No contacts found' : 'No contacts yet'}
          </Text>
          {isOffline && (
            <Text style={styles.offlineText}>
              You are currently offline
            </Text>
          )}
        </View>
      );
    }

    // Filter contacts that match the search criteria
    const filteredContacts = contacts.phonebooks.filter(contact => 
      contactMatchesSearch(contact, search)
    );

    if (filteredContacts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contacts found</Text>
        </View>
      );
    }

    // Create a map to store unique contacts by ID
    const uniqueContacts = new Map();
    filteredContacts.forEach(contact => {
      // Only keep the latest version of each contact
      if (!uniqueContacts.has(contact.id) || 
          (contact.status === 'pending' && uniqueContacts.get(contact.id).status !== 'pending')) {
        uniqueContacts.set(contact.id, contact);
      }
    });

    return (
      <>
        {Array.from(uniqueContacts.values()).map((contact: Contact) => (
          <ContactCard
            key={`contact_${contact.id}`}
            contact={contact}
            onEdit={handleEditContact}
            onDelete={() => handleDeleteContact(contact.id)}
            onAvatarPress={() => handleAvatarPress(contact)}
            onResend={contact.status === 'pending' ? () => handleResendContact(contact) : undefined}
            onStartEditing={() => handleStartEditing(contact.id)}
            onStopEditing={() => handleStopEditing(contact.id)}
            isEditing={editingContactIds.has(contact.id)}
          />
        ))}
        {isLoadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#b08968" />
          </View>
        )}
        {!hasMoreData && filteredContacts.length > 0 && (
          <Text style={styles.endOfListText}>
            {isOffline ? 'Offline mode - showing cached contacts' : 'No more contacts to load'}
          </Text>
        )}
      </>
    );
  }, [contacts, isLoadingMore, hasMoreData, isOffline, search, editingContactIds, handleDeleteContact, handleResendContact, contactMatchesSearch]);

  if (!isInitialized || (loading && !isLoadingMore)) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#b08968" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={handleSortToggle}
            >
              <FontAwesomeIcon
                icon={sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp}
                size={ICON_SIZE}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() => {
              if (search.trim()) {
                fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
              }
            }}
            containerStyle={styles.searchBar}
            autoFocus={false}
            placeholder="Search by name or phone..."
            placeholderTextColor="#999"
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddContact')}
            >
              <FontAwesomeIcon
                icon={Platform.OS === 'ios' ? faCirclePlus : faUserPlus}
                size={ICON_SIZE}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderContactList()}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b08968',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#b08968',
    height: HEADER_HEIGHT,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButton: {
    marginTop: 10,
    padding: 8,
  },
  addButton: {
    marginTop: 10,
    padding: 8,
  },
  searchBar: {
    marginTop: 10,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: SCREEN_HEIGHT * 0.2,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfListText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  offlineText: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
  },
});

export default HomeScreen;
