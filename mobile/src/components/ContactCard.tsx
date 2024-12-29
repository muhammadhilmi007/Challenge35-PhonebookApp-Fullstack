import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.1.11:3001';
const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

interface Contact {
  id: number;
  name: string;
  phone: string;
  photo?: string;
}

interface ContactCardProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onAvatarPress: () => void;
  isEditing: boolean;
  onSave: (updatedContact: Contact) => void;
  onCancel: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = Math.min(Math.max(SCREEN_WIDTH * 0.15, 50), 60);

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onAvatarPress,
  isEditing,
  onSave,
  onCancel,
}) => {
  const [editedName, setEditedName] = useState(contact.name);
  const [editedPhone, setEditedPhone] = useState(contact.phone);

  useEffect(() => {
    if (isEditing) {
      setEditedName(contact.name);
      setEditedPhone(contact.phone);
    }
  }, [isEditing, contact]);

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }
    if (!editedPhone.trim()) {
      Alert.alert('Validation Error', 'Phone number cannot be empty');
      return;
    }
    onSave({
      ...contact,
      name: editedName.trim(),
      phone: editedPhone.trim(),
    });
  };

  const getAvatarSource = (): any => {
    if (!contact.photo || contact.photo === '/user-avatar.svg') {
      return DEFAULT_AVATAR;
    }

    // If it's a complete URL, use it directly
    if (contact.photo.startsWith('http')) {
      return { uri: contact.photo };
    }

    // For relative paths, construct the full URL
    const photoPath = contact.photo.startsWith('/') ? contact.photo.slice(1) : contact.photo;
    return { uri: `${API_URL}/${photoPath}` };
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onAvatarPress}>
        <Image
          source={getAvatarSource()}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Name"
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={editedPhone}
              onChangeText={setEditedPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.phone}>{contact.phone}</Text>
          </>
        )}
      </View>
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <FontAwesomeIcon icon={faCheck} size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onCancel}>
              <FontAwesomeIcon icon={faTimes} size={20} color="#f44336" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={confirmDelete}>
              <FontAwesomeIcon icon={faTrash} size={20} color="#f44336" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ContactCard;
