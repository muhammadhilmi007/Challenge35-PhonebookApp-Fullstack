import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContactCardProps } from '../types';

const API_URL = 'http://192.168.1.3:3001';
const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, onAvatarPress, onResend }) => {
  const [imageError, setImageError] = useState<boolean>(false);

  const getAvatarSource = (): ImageSourcePropType => {
    if (imageError) {
      return DEFAULT_AVATAR;
    }
    
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

  const confirmDelete = (): void => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: onDelete, style: "destructive" }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onAvatarPress} style={styles.avatarContainer}>
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
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phone}</Text>
        {contact.status === 'pending' && (
          <Text style={styles.pendingText}>Pending</Text>
        )}
      </View>
      <View style={styles.actions}>
        {contact.status === 'pending' && onResend && (
          <TouchableOpacity onPress={onResend} style={styles.actionButton}>
            <Ionicons name="refresh" size={24} color="#34C759" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Ionicons name="pencil" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} style={styles.actionButton}>
          <Ionicons name="trash" size={24} color="#FF3B30" />
        </TouchableOpacity>
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
});

export default ContactCard;
