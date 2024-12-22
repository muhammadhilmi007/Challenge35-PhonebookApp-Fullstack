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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContactCard from '@components/ContactCard';
import SearchBar from '@components/SearchBar';
import Loading from '@components/Loading';
import { useContacts } from '@hooks/useContacts';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 76; // Includes status bar
const ICON_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.06, 24), 32); // Responsive icon size
const ITEMS_PER_PAGE = 10;

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { contacts, loading, error, fetchContacts, removeContact, editContact } = useContacts();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch contacts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder);
      setCurrentPage(1);
    }, [fetchContacts, sortOrder])
  );

  // Initial fetch
  useEffect(() => {
    fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder);
  }, [fetchContacts, sortOrder]);

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    fetchContacts(1, ITEMS_PER_PAGE, 'name', newSortOrder, search);
  };

  const handleEdit = (contact) => {
    navigation.navigate('EditContact', { contact });
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeContact(id);
              if (!success) {
                Alert.alert('Error', 'Failed to delete contact. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAvatarPress = (contact) => {
    navigation.navigate('Avatar', {
      contact,
      onAvatarSelect: async (newAvatar) => {
        try {
          await editContact(contact.id, { ...contact, avatar: newAvatar });
        } catch (error) {
          console.error('Error updating avatar:', error);
          Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
      },
    });
  };

  const handleAddContact = () => {
    navigation.navigate('AddContact');
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder, search);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearch('');
    setCurrentPage(1);
    await fetchContacts(1, ITEMS_PER_PAGE, 'name', sortOrder);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !contacts || currentPage >= contacts.pages) {
      return;
    }

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      await fetchContacts(nextPage, ITEMS_PER_PAGE, 'name', sortOrder, search);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more contacts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      handleLoadMore();
    }
  };

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

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {search ? 'No contacts found matching your search' : 'No contacts yet'}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
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
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-down' : 'arrow-up'} 
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
            <Ionicons name="person-add" size={ICON_SIZE} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            !contacts?.phonebooks?.length && styles.emptyScrollContent
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
          {contacts?.phonebooks?.length > 0 ? (
            <>
              {contacts.phonebooks.map((contact, index) => (
                <ContactCard
                  key={`${contact.id}-${index}`}
                  contact={contact}
                  onEdit={() => handleEdit(contact)}
                  onDelete={() => handleDelete(contact.id)}
                  onAvatarPress={() => handleAvatarPress(contact)}
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
    paddingHorizontal: Math.max(16, SCREEN_WIDTH * 0.04), // Responsive padding
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
    marginHorizontal: Math.max(8, SCREEN_WIDTH * 0.02), // Responsive margin
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Math.max(10, SCREEN_HEIGHT * 0.01), // Responsive padding
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingMore: {
    padding: Math.max(16, SCREEN_HEIGHT * 0.02), // Responsive padding
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