import { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

const AvatarUpload = ({ contactId, currentAvatar, onUpdate, onClose }) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async (useCamera = false) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera permissions to take a photo');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant gallery permissions to select a photo');
          return;
        }
      }

      // Launch camera or image picker
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (imageAsset) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('photo', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const updatedContact = await api.updateAvatar(contactId, formData);
      onUpdate(updatedContact);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentAvatar || 'https://via.placeholder.com/150' }}
        style={styles.preview}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => pickImage(true)}
          disabled={uploading}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => pickImage(false)}
          disabled={uploading}
        >
          <Ionicons name="images" size={24} color="#fff" />
          <Text style={styles.buttonText}>Choose Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  preview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});