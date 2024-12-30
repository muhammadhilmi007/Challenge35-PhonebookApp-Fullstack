import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSortAlphaDown, faSortAlphaUp, faUserPlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import ContactCard from '@components/ContactCard';
import SearchBar from '@components/SearchBar';
import Loading from '@components/Loading';
import { useContactsRedux as useContacts } from '@hooks/useContactsRedux';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 76;
const ICON_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.06, 24), 32);
const ITEMS_PER_PAGE = 10;

interface Contact {
  id: number;
  name: string;
  phone: string;
  photo?: string;
}

interface ContactsResponse {
  phonebooks: Contact[];
  pages: number;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [search, setSearch] = useState<string>('');
  const { contacts, loading, error, fetchContacts, removeContact, editContact } = useContacts();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [editingContacts, setEditingContacts] = useState<Set<number>>(new Set());
  const [lastSearchParams, setLastSearchParams] = useState<{
    search: string;
    sortOrder: 'asc' | 'desc';
    page: number;
  }>({ search: '', sortOrder: 'asc', page: 1 });

  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, use the last search parameters
      const loadContacts = () => {
        fetchContacts(
          lastSearchParams.page,
          ITEMS_PER_PAGE,
          'name',
          lastSearchParams.sortOrder,
          lastSearchParams.search
        );
      };
      loadContacts();
    }, [fetchContacts, lastSearchParams])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (contacts?.phonebooks) {
        setLastSearchParams({
          search,
          sortOrder,
          page: currentPage
        });
        fetchContacts(currentPage, ITEMS_PER_PAGE, 'name', sortOrder, search);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, sortOrder]);

  useEffect(() => {
    if (contacts?.phonebooks) {
      const filtered = [...contacts.phonebooks].sort((a, b) => 
        sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
      setFilteredContacts(filtered);
    }
  }, [contacts?.phonebooks, sortOrder]);

  const handleSort = (): void => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setLastSearchParams(prev => ({
      ...prev,
      sortOrder: newSortOrder,
      page: 1
    }));
    setCurrentPage(1);
    fetchContacts(1, ITEMS_PER_PAGE, 'name', newSortOrder, search);
  };

  const handleEdit = (contact: Contact): void => {
    setEditingContacts(prev => {
      const newSet = new Set(prev);
      newSet.add(contact.id);
      return newSet;
    });
  };

  const handleSaveEdit = async (updatedContact: Contact): Promise<void> => {
    try {
      await editContact(updatedContact.id, updatedContact);
      setEditingContacts(prev => {
        const newSet = new Set(prev);
        newSet.delete(updatedContact.id);
        return newSet;
      });
      fetchContacts(currentPage, ITEMS_PER_PAGE, 'name', sortOrder, search);
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', 'Failed to update contact. Please try again.');
    }
  };

  const handleCancelEdit = (contactId: number): void => {
    setEditingContacts(prev => {
      const newSet = new Set(prev);
      newSet.delete(contactId);
      return newSet;
    });
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const success = await removeContact(id);
      if (success) {
        // Remove from editing state if being edited
        setEditingContacts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        // Refresh the contacts list
        fetchContacts(currentPage, ITEMS_PER_PAGE, 'name', sortOrder, search);
      } else {
        Alert.alert('Error', 'Failed to delete contact. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      Alert.alert('Error', 'Failed to delete contact. Please try again.');
    }
  };

  const handleAvatarPress = (contact: Contact): void => {
    navigation.navigate('Avatar', {
      contact,
      onAvatarSelect: async (newAvatar: string | null) => {
        try {
          await editContact(contact.id, { ...contact, avatar: newAvatar });
        } catch (error) {
          console.error('Error updating avatar:', error);
          Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
      },
    });
  };

  const handleAddContact = (): void => {
    navigation.navigate('AddContact');
  };

  const handleSearch = (): void => {
    setCurrentPage(1);
    setLastSearchParams(prev => ({
      ...prev,
      search,
      page: 1
    }));
    fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search);
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    setSearch('');
    setCurrentPage(1);
    const newParams = { search: '', sortOrder, page: 1 };
    setLastSearchParams(newParams);
    await fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder);
    setRefreshing(false);
  };

  const handleLoadMore = async (): Promise<void> => {
    if (loadingMore || !contacts || currentPage >= contacts.pages || loading) {
      return;
    }

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      setLastSearchParams(prev => ({
        ...prev,
        page: nextPage
      }));
      await fetchContacts(nextPage, ITEMS_PER_PAGE, 'name', sortOrder, search);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more contacts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isCloseToBottom && !loadingMore && !loading) {
      handleLoadMore();
    }
  }, [loadingMore, loading, handleLoadMore]);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !contacts?.phonebooks?.length) {
    return <Loading />;
  }

  const EmptyComponent = (): JSX.Element => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {search ? 'No contacts found matching your search' : 'No contacts yet'}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <FontAwesomeIcon icon={faCirclePlus} size={24} color="#007AFF" />
        <Text style={styles.addButtonText}>Add New Contact</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#b08968" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSort}>
            <FontAwesomeIcon 
              icon={sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp} 
              size={ICON_SIZE} 
              color="#fff" 
            />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onSubmit={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddContact}>
            <FontAwesomeIcon icon={faUserPlus} size={ICON_SIZE} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            !filteredContacts.length && styles.emptyScrollContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#b08968']}
              tintColor="#b08968"
            />
          }
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {filteredContacts.length > 0 ? (
            <>
              {filteredContacts.map((contact, index) => (
                <ContactCard
                  key={`${contact.id}-${index}`}
                  contact={contact}
                  onEdit={() => handleEdit(contact)}
                  onDelete={() => handleDelete(contact.id)}
                  onAvatarPress={() => handleAvatarPress(contact)}
                  isEditing={editingContacts.has(contact.id)}
                  onSave={handleSaveEdit}
                  onCancel={() => handleCancelEdit(contact.id)}
                />
              ))}
              {loadingMore && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#b08968" />
                </View>
              )}
            </>
          ) : (
            <EmptyComponent />
          )}
        </ScrollView>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#b08968',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
  },
  headerButton: {
    width: ICON_SIZE * 2,
    height: ICON_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ICON_SIZE,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: Math.max(8, SCREEN_WIDTH * 0.02),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Math.max(10, SCREEN_HEIGHT * 0.01),
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingMore: {
    padding: Math.max(16, SCREEN_HEIGHT * 0.02),
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
