import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ImageSourcePropType,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContactCardProps } from '../types';

const API_URL = 'http://192.168.1.3:3001';
const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  onEdit, 
  onDelete, 
  onAvatarPress, 
  onResend,
  onStartEditing,
  onStopEditing,
  isEditing 
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(contact.name);
  const [editedPhone, setEditedPhone] = useState<string>(contact.phone);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Reset edited values when contact changes or editing stops
  useEffect(() => {
    if (!isEditing) {
      setEditedName(contact.name);
      setEditedPhone(contact.phone);
    }
  }, [contact, isEditing]);

  const getAvatarSource = useCallback((): ImageSourcePropType => {
    if (imageError) {
      return DEFAULT_AVATAR;
    }
    
    if (!contact.photo || contact.photo === '/user-avatar.svg') {
      return DEFAULT_AVATAR;
    }

    if (contact.photo.startsWith('http')) {
      return { uri: contact.photo };
    }

    const photoPath = contact.photo.startsWith('/') ? contact.photo.slice(1) : contact.photo;
    return { uri: `${API_URL}/${photoPath}` };
  }, [contact.photo, imageError]);

  const confirmDelete = useCallback((): void => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: onDelete, style: "destructive" }
      ]
    );
  }, [onDelete]);

  const handleEdit = useCallback(async () => {
    if (isEditing) {
      // Validate inputs
      if (!editedName.trim() || !editedPhone.trim()) {
        Alert.alert('Error', 'Name and phone number are required');
        return;
      }

      setIsSaving(true);
      try {
        await onEdit({
          ...contact,
          name: editedName.trim(),
          phone: editedPhone.trim(),
        });
      } catch (error) {
        console.error('Error updating contact:', error);
        Alert.alert('Error', 'Failed to update contact');
      } finally {
        setIsSaving(false);
      }
    } else {
      onStartEditing();
    }
  }, [isEditing, editedName, editedPhone, contact, onEdit, onStartEditing]);

  const handleCancel = useCallback(() => {
    setEditedName(contact.name);
    setEditedPhone(contact.phone);
    onStopEditing();
  }, [contact, onStopEditing]);

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={onAvatarPress} 
        style={styles.avatarContainer}
        disabled={isEditing}
      >
        <Image
          source={getAvatarSource()}
          style={styles.avatar}
          onError={() => {
            console.log('Image load error for:', contact.photo);
            setImageError(true);
          }}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter name"
              autoCapitalize="words"
              autoFocus={true}
            />
            <TextInput
              style={styles.input}
              value={editedPhone}
              onChangeText={setEditedPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
        ) : (
          <>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.phone}>{contact.phone}</Text>
            {contact.status === 'pending' && (
              <Text style={styles.pendingText}>Pending</Text>
            )}
          </>
        )}
      </View>
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity onPress={handleCancel} style={styles.actionButton}>
              <Ionicons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleEdit} 
              style={styles.actionButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#34C759" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#34C759" />
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {contact.status === 'pending' && onResend && (
              <TouchableOpacity onPress={onResend} style={styles.actionButton}>
                <Ionicons name="refresh" size={24} color="#34C759" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} style={styles.actionButton}>
              <Ionicons name="trash" size={24} color="#FF3B30" />
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
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  editContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
});

export default React.memo(ContactCard);
