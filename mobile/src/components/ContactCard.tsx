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
import { Contact } from '../store/contactsSlice';

const API_URL = 'http://192.168.0.119:3001';
const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => Promise<void>;
  onDelete: () => void;
  onAvatarPress: () => void;
  onResend?: () => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  isEditing: boolean;
}

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
  const [imageError, setImageError] = useState(false);
  const [editedName, setEditedName] = useState(contact.name);
  const [editedPhone, setEditedPhone] = useState(contact.phone);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditedName(contact.name);
      setEditedPhone(contact.phone);
    }
  }, [contact, isEditing]);

  const getAvatarSource = useCallback((): ImageSourcePropType => {
    if (imageError || !contact.photo || contact.photo === '/user-avatar.svg') {
      return DEFAULT_AVATAR;
    }
    
    if (contact.photo.startsWith('http')) {
      return { uri: contact.photo };
    }

    const photoPath = contact.photo.startsWith('/') ? contact.photo.slice(1) : contact.photo;
    return { uri: `${API_URL}/${photoPath}` };
  }, [contact.photo, imageError]);

  const confirmDelete = useCallback(() => {
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
    if (!isEditing) {
      return onStartEditing();
    }

    if (!editedName.trim() || !editedPhone.trim()) {
      return Alert.alert('Error', 'Name and phone number are required');
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
  }, [isEditing, editedName, editedPhone, contact, onEdit, onStartEditing]);

  const handleCancel = useCallback(() => {
    setEditedName(contact.name);
    setEditedPhone(contact.phone);
    onStopEditing();
  }, [contact, onStopEditing]);

  const renderEditMode = () => (
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
  );

  const renderViewMode = () => (
    <>
      <Text style={styles.name}>{contact.name}</Text>
      <Text style={styles.phone}>{contact.phone}</Text>
      {contact.status === 'pending' && (
        <Text style={styles.pendingText}>Pending</Text>
      )}
    </>
  );

  const renderEditActions = () => (
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
  );

  const renderViewActions = () => (
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
  );

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
        {isEditing ? renderEditMode() : renderViewMode()}
      </View>
      <View style={styles.actions}>
        {isEditing ? renderEditActions() : renderViewActions()}
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
    shadowOffset: { width: 0, height: 2 },
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
