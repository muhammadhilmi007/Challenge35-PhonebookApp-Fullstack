import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const INPUT_HEIGHT = Math.min(Math.max(SCREEN_WIDTH * 0.1, 36), 44); // Responsive height
const ICON_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.05, 18), 24); // Responsive icon size

const SearchBar = ({ value, onChangeText, onSubmit }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Ionicons 
            name="search" 
            size={ICON_SIZE}
            color="#666" 
          />
        </View>
        <TextInput
          style={[
            styles.input,
            { fontSize: Math.min(Math.max(SCREEN_WIDTH * 0.04, 14), 16) } // Responsive font size
          ]}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor="#666"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Math.min(INPUT_HEIGHT * 0.1, 4), // Responsive border radius
    height: INPUT_HEIGHT,
  },
  searchIconContainer: {
    width: INPUT_HEIGHT,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#000',
    height: '100%',
    paddingVertical: Math.min(INPUT_HEIGHT * 0.2, 8), // Responsive padding
    paddingRight: Math.min(INPUT_HEIGHT * 0.3, 12), // Responsive padding
  },
});

export default SearchBar;