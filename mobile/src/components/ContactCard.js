import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.1.9:3001';
const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

const ContactCard = ({ contact, onEdit, onDelete, onAvatarPress }) => {
  const [imageError, setImageError] = useState(false);

  const getAvatarSource = () => {
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

  const confirmDelete = () => {
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
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Ionicons name="pencil" size={20} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
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
    marginHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e1e1e1',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#7f8c8d',
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