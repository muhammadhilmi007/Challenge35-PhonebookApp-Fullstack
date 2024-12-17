import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText, onSort, onAdd }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search contacts..."
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      
      <TouchableOpacity onPress={() => onSort('name', 'asc')} style={styles.button}>
        <Ionicons name="filter" size={24} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onAdd} style={styles.button}>
        <Ionicons name="add" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  button: {
    padding: 10,
    marginLeft: 5,
  },
});
