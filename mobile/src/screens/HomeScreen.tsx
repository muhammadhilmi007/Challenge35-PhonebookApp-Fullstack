import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserPlus, faCirclePlus, faArrowDownZA, faArrowUpAZ } from '@fortawesome/free-solid-svg-icons';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import { useDebounce, contactActions, contactSelectors } from '../store/contactsSlice';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '@/App';
import { Contact } from '../store/contactsSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sortContacts } from '../store/contactsSlice';
import { useDispatch, useSelector } from 'react-redux';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 95;
const ICON_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.06, 24), 32);
const ITEMS_PER_PAGE = 10;

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const contacts = useSelector(contactSelectors.selectContacts);
  const loading = useSelector(contactSelectors.selectLoading);
  const error = useSelector(contactSelectors.selectError);
  const isOffline = useSelector(contactSelectors.selectIsOffline);

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

  // Initialize contacts and handle screen focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          if (!isInitialized) {
            await contactActions.fetchContacts(dispatch, 1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
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
    }, [isInitialized, dispatch, debouncedSearchValue, sortOrder])
  );

  // Effect for handling search and sort changes
  useEffect(() => {
    if (isInitialized) {
      setPage(1);
      setHasMoreData(true);
      contactActions.fetchContacts(dispatch, 1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
    }
  }, [debouncedSearchValue, sortOrder, isInitialized, dispatch]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMoreData || isLoadingMore || loading || contacts.page >= contacts.pages) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await contactActions.fetchContacts(
        dispatch,
        page + 1,
        ITEMS_PER_PAGE,
        'name',
        sortOrder,
        debouncedSearchValue
      );
      setPage(prev => prev + 1);
      setHasMoreData(contacts.page < contacts.pages);
    } catch (err) {
      console.error('Error loading more contacts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreData, isLoadingMore, loading, contacts.page, contacts.pages, page, sortOrder, debouncedSearchValue, dispatch]);

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
          const updatedPhonebooks = sortContacts(
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
      const success = await contactActions.updateContact(dispatch, contact.id, {
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
            const revertedPhonebooks = sortContacts(
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

  const handleDelete = useCallback(async (id: string) => {
    const success = await contactActions.deleteContact(dispatch, id);
    if (success) {
      contactActions.fetchContacts(dispatch, 1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
    }
  }, [dispatch, sortOrder, debouncedSearchValue]);

  const handleResend = useCallback(async (contact: Contact) => {
    const success = await contactActions.resendContact(dispatch, contact);
    if (success) {
      contactActions.fetchContacts(dispatch, 1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
    }
  }, [dispatch, sortOrder, debouncedSearchValue]);

  const renderEmptyList = useCallback(() => {
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
  }, [search, isOffline]);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#b08968" />
        </View>
      );
    }

    if (!hasMoreData && contacts.phonebooks.length > 0) {
      return (
        <Text style={styles.endOfListText}>
          {isOffline ? 'Offline mode - showing cached contacts' : 'No more contacts to load'}
        </Text>
      );
    }

    return null;
  }, [isLoadingMore, hasMoreData, contacts.phonebooks.length, isOffline]);

  const renderItem = useCallback(({ item: contact }: { item: Contact }) => {
    return (
      <ContactCard
        key={`contact_${contact.id}`}
        contact={contact}
        onEdit={handleEditContact}
        onDelete={() => handleDelete(contact.id)}
        onAvatarPress={() => handleAvatarPress(contact)}
        onResend={contact.status === 'pending' ? () => handleResend(contact) : undefined}
        onStartEditing={() => handleStartEditing(contact.id)}
        onStopEditing={() => handleStopEditing(contact.id)}
        isEditing={editingContactIds.has(contact.id)}
      />
    );
  }, [handleEditContact, handleDelete, handleAvatarPress, handleResend, editingContactIds]);

  const getFilteredContacts = useCallback(() => {
    if (!contacts?.phonebooks?.length) {
      return [];
    }

    // Filter contacts that match the search criteria
    const filteredContacts = contacts.phonebooks.filter(contact => 
      contactMatchesSearch(contact, search)
    );

    // Create a map to store unique contacts by ID
    const uniqueContacts = new Map();
    filteredContacts.forEach(contact => {
      // Only keep the latest version of each contact
      if (!uniqueContacts.has(contact.id) || 
          (contact.status === 'pending' && uniqueContacts.get(contact.id).status !== 'pending')) {
        uniqueContacts.set(contact.id, contact);
      }
    });

    return Array.from(uniqueContacts.values());
  }, [contacts, search, contactMatchesSearch]);

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
                icon={sortOrder === 'asc' ? faArrowDownZA : faArrowUpAZ}
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
                contactActions.fetchContacts(dispatch, 1, ITEMS_PER_PAGE, 'name', sortOrder, debouncedSearchValue);
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
          <FlatList
            data={getFilteredContacts()}
            renderItem={renderItem}
            keyExtractor={(item) => `contact_${item.id}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />
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
  listContent: {
    flexGrow: 1,
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
