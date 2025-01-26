import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSortAlphaDown, faSortAlphaUp, faUserPlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import { useContacts } from '../hooks/useContacts';
import { useFocusEffect } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../types/navigation';
import { Contact } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 76;
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const {
    contacts,
    loading,
    error,
    isOffline,
    fetchContacts,
    handleDeleteContact,
    handleResendContact,
  } = useContacts();

  // Initialize contacts when component mounts
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing contacts:', err);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeData();
    }
  }, []);

  // Refresh contacts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isInitialized) {
        const refresh = async () => {
          try {
            await fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search);
          } catch (err) {
            console.error('Error refreshing contacts:', err);
          }
        };
        refresh();
      }
    }, [isInitialized, fetchContacts, sortOrder, search])
  );

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isInitialized) {
        fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search);
        setPage(1);
        setHasMoreData(true);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [search, sortOrder, fetchContacts, isInitialized]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search);
    } finally {
      setRefreshing(false);
    }
  };

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
      contacts.page >= contacts.pages ||
      isOffline // Don't load more in offline mode
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      await fetchContacts(nextPage, ITEMS_PER_PAGE, 'name', sortOrder, search);
      setPage(nextPage);
      
      // Check if we have more data
      if (nextPage >= contacts.pages) {
        setHasMoreData(false);
      }
    } catch (err) {
      console.error('Error loading more contacts:', err);
      setHasMoreData(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, loading, contacts, hasMoreData, page, fetchContacts, sortOrder, search, isOffline]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    if (isCloseToBottom(event.nativeEvent)) {
      handleLoadMore();
    }
  }, [isCloseToBottom, handleLoadMore]);

  const handleSortToggle = (): void => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleEditContact = (contact: Contact): void => {
    navigation.navigate('EditContact', { contact });
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
        </View>
      );
    }

    // Create a map to store unique contacts by ID
    const uniqueContacts = new Map();
    contacts.phonebooks.forEach(contact => {
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
            onEdit={() => handleEditContact(contact)}
            onDelete={() => handleDeleteContact(contact.id)}
            onAvatarPress={() => handleAvatarPress(contact)}
            onResend={contact.status === 'pending' ? () => handleResendContact(contact) : undefined}
          />
        ))}
        {isLoadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#b08968" />
          </View>
        )}
        {!hasMoreData && contacts.phonebooks.length > 0 && !isOffline && (
          <Text style={styles.endOfListText}>
            No more contacts to load
          </Text>
        )}
      </>
    );
  }, [contacts, isLoadingMore, hasMoreData, isOffline, search, handleDeleteContact, handleResendContact]);

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
                fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search.trim());
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#b08968']}
                tintColor="#b08968"
              />
            }
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
    paddingBottom: 20,
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
