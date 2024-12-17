import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactCard = ({ contact, onEdit, onDelete, onAvatarPress }) => {
  const confirmDelete = () => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => onDelete(contact.id),
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => onAvatarPress(contact)}>
        <Image
          source={{ uri: contact.photo || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      
      <View style={styles.info}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phone}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(contact)} style={styles.iconButton}>
          <Ionicons name="pencil" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
          <Ionicons name="trash" size={24} color="#666" />
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
    borderRadius: 8,
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
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginHorizontal: 5,
  },
});