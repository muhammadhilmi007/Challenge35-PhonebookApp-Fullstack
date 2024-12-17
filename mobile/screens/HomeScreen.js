import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  const loadContacts = async (refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;

    try {
      setLoading(true);
      const currentPage = refresh ? 1 : page;
      const data = await api.getContacts(currentPage, 10, 'name', 'asc', search);

      setContacts(prev => 
        refresh ? data.phonebooks : [...prev, ...data.phonebooks]
      );
      setHasMore(data.page < data.pages);
      setPage(prev => refresh ? 2 : prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContacts(true);
    }, [search])
  );

  const handleEdit = (contact) => {
    navigation.navigate('EditContact', { contact });
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete contact');
    }
  };

  const handleAvatarPress = (contact) => {
    navigation.navigate('EditContact', { contact, showAvatarUpload: true });
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setContacts([]);
          setPage(1);
          setHasMore(true);
        }}
        onSort={() => {}} // To be implemented
        onAdd={() => navigation.navigate('AddContact')}
      />
      
      <FlatList
        data={contacts}
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAvatarPress={handleAvatarPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => loadContacts(false)}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#f5f5f5',
},
});