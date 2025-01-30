import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  Platform,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AvatarScreenNavigationProp, AvatarScreenRouteProp } from '../types/navigation';
import Loading from '../components/Loading';
import { useContacts } from '../hooks/useContacts';
import { API_BASE_URL, DEFAULT_AVATAR as DEFAULT_AVATAR_PATH, IMAGE_QUALITY, IMAGE_ASPECT } from '../services/api';

const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

interface Props {
  route: AvatarScreenRouteProp;
  navigation: AvatarScreenNavigationProp;
}

const AvatarScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contact } = route.params;
  const { handleUpdateContact, loading: updateLoading } = useContacts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getAvatarSource = (): ImageSourcePropType => {
    if (selectedImage) {
      return { uri: selectedImage };
    }

    if (!contact.photo || contact.photo === DEFAULT_AVATAR_PATH) {
      return DEFAULT_AVATAR;
    }

    if (contact.photo.startsWith('http')) {
      return { uri: contact.photo };
    }

    const photoPath = contact.photo.startsWith('/') ? contact.photo.slice(1) : contact.photo;
    return { uri: `${API_BASE_URL}/${photoPath}` };
  };

  const handleImagePicker = async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: IMAGE_ASPECT,
        quality: IMAGE_QUALITY,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCamera = async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your camera');
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: IMAGE_ASPECT,
        quality: IMAGE_QUALITY,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!selectedImage) {
      navigation.goBack();
      return;
    }

    try {
      const updatedContact = {
        ...contact,
        avatar: selectedImage,
      };
      
      // Remove properties that shouldn't be sent to the API
      delete updatedContact.status;
      delete updatedContact.sent;
      
      const success = await handleUpdateContact(contact.id, updatedContact);
      
      if (success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        {selectedImage && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            {updateLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.imageContainer}>
        <Image source={getAvatarSource()} style={styles.image} resizeMode="contain" />
      </View>

      {loading ? (
        <Loading />
      ) : (
        <BlurView intensity={100} tint="dark" style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCamera}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.actionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleImagePicker}>
            <Ionicons name="image" size={24} color="#fff" />
            <Text style={styles.actionText}>Choose Photo</Text>
          </TouchableOpacity>
        </BlurView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  closeButton: {
    padding: 10,
  },
  saveButton: {
    padding: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
});

export default AvatarScreen;
