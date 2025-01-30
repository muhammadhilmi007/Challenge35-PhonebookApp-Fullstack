import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useContacts } from '../hooks/useContacts';
import Loading from '../components/Loading';
import { EditContactScreenNavigationProp, EditContactScreenRouteProp } from '../types/navigation';
import { API_URL } from '../services/api';

const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

interface Props {
  route: EditContactScreenRouteProp;
  navigation: EditContactScreenNavigationProp;
}

const EditContactScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contact } = route.params;
  const { handleUpdateContact, loading } = useContacts();
  
  const [name, setName] = useState<string>(contact.name);
  const [phone, setPhone] = useState<string>(contact.phone);
  const [avatar, setAvatar] = useState<string | undefined>(contact.avatar);

  const getAvatarSource = () => {
    if (avatar) {
      return { uri: avatar };
    }

    if (!contact.photo || contact.photo === '/user-avatar.svg') {
      return DEFAULT_AVATAR;
    }

    if (contact.photo.startsWith('http')) {
      return { uri: contact.photo };
    }

    const photoPath = contact.photo.startsWith('/') ? contact.photo.slice(1) : contact.photo;
    return { uri: `${API_URL}/${photoPath}` };
  };

  const handleSave = async (): Promise<void> => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    try {
      const success = await handleUpdateContact(contact.id, {
        name: name.trim(),
        phone: phone.trim(),
        avatar,
      });

      if (success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', 'Failed to update contact. Please try again.');
    }
  };

  const handleAvatarPress = (): void => {
    navigation.navigate('Avatar', {
      contact: {
        ...contact,
        avatar: avatar || undefined,
      },
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleAvatarPress}>
          <Image
            source={getAvatarSource()}
            style={styles.avatar}
            onError={() => console.log('Image load error for:', contact.photo)}
          />
          <View style={styles.editAvatarButton}>
            <Text style={styles.editAvatarText}>Edit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditContactScreen;
