import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.1.9:3001';
const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

const AvatarScreen = ({ route, navigation }) => {
  const { contact, onAvatarSelect } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAvatarSource = () => {
    if (selectedImage) {
      return { uri: selectedImage };
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

  const handleSelectFromLibrary = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to use your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove the current photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setSelectedImage(null);
            onAvatarSelect(null);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onAvatarSelect(selectedImage);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving avatar:', error);
      Alert.alert('Error', 'Failed to save avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Avatar</Text>
        {selectedImage && (
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.previewContainer}>
        <Image 
          source={getAvatarSource()} 
          style={styles.preview}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>

      <BlurView intensity={100} style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleTakePhoto}
          disabled={loading}
        >
          <Ionicons name="camera" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSelectFromLibrary}
          disabled={loading}
        >
          <Ionicons name="images" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Choose from Library</Text>
        </TouchableOpacity>

        {(selectedImage || contact.photo) && (
          <TouchableOpacity 
            style={[styles.button, styles.removeButton]} 
            onPress={handleRemovePhoto}
            disabled={loading}
          >
            <Ionicons name="trash" size={24} color="#ff3b30" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.removeButtonText]}>Remove Photo</Text>
          </TouchableOpacity>
        )}
      </BlurView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 15,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#ff3b30',
  },
});

export default AvatarScreen;