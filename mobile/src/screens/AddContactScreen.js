import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useContacts } from '@hooks/useContacts';
import Loading from '@components/Loading';

const AddContactScreen = ({ navigation }) => {
  const { createContact, loading } = useContacts();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    try {
      const success = await createContact({
        name: name.trim(),
        phone: phone.trim(),
        avatar,
      });

      if (success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to add contact. Please try again.');
    }
  };

  const handleSelectImage = async () => {
    try {
      setImageLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handleSelectImage}
          disabled={imageLoading}
        >
          {imageLoading ? (
            <View style={styles.avatarPlaceholder}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : avatar ? (
            <Image 
              source={{ uri: avatar }} 
              style={styles.avatar}
              onError={() => {
                console.error('Error loading image');
                setAvatar(null);
              }}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {name ? name.charAt(0).toUpperCase() : '+'}
              </Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>
            {imageLoading ? 'Loading...' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <TouchableOpacity 
          style={[
            styles.button, 
            (!name.trim() || !phone.trim() || loading || imageLoading) ? styles.buttonDisabled : null
          ]}
          onPress={handleSave}
          disabled={!name.trim() || !phone.trim() || loading || imageLoading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Contact</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: '#666',
  },
  changePhotoText: {
    marginTop: 10,
    color: '#007AFF',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddContactScreen;