import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AvatarScreen from '../AvatarScreen';

// Mock the native modules and dependencies
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView'
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'images'
  }
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('AvatarScreen', () => {
  const mockContact = {
    id: 1,
    name: 'John Doe',
    phone: '1234567890',
    photo: '/user-avatar.svg'
  };

  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn()
  };

  const mockRoute = {
    params: {
      contact: mockContact,
      onAvatarSelect: jest.fn()
    }
  };

  const defaultProps = {
    navigation: mockNavigation,
    route: mockRoute
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful permissions
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  });

  it('renders correctly with default avatar', () => {
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    expect(getByTestId('avatar-image')).toBeTruthy();
  });

  it('renders correctly with custom avatar', () => {
    const propsWithPhoto = {
      ...defaultProps,
      route: {
        params: {
          contact: {
            ...mockContact,
            photo: 'https://example.com/photo.jpg'
          },
          onAvatarSelect: jest.fn()
        }
      }
    };
    const { getByTestId } = render(<AvatarScreen {...propsWithPhoto} />);
    expect(getByTestId('avatar-image')).toBeTruthy();
  });

  it('shows action buttons', () => {
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    expect(getByTestId('take-photo-button')).toBeTruthy();
    expect(getByTestId('choose-photo-button')).toBeTruthy();
  });

  it('handles camera permission denial', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    await act(async () => {
      fireEvent.press(getByTestId('take-photo-button'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Permission Required',
      'Camera permission is required to take photos.',
      expect.any(Array)
    );
  });

  it('handles gallery permission denial', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    await act(async () => {
      fireEvent.press(getByTestId('choose-photo-button'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Permission Required',
      'Gallery permission is required to choose photos.',
      expect.any(Array)
    );
  });

  it('handles successful photo capture', async () => {
    const mockImage = {
      assets: [{
        uri: 'file://test.jpg',
        width: 100,
        height: 100
      }]
    };
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue(mockImage);
    
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    await act(async () => {
      fireEvent.press(getByTestId('take-photo-button'));
    });

    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
  });

  it('handles successful photo selection', async () => {
    const mockImage = {
      assets: [{
        uri: 'file://test.jpg',
        width: 100,
        height: 100
      }]
    };
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImage);
    
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    await act(async () => {
      fireEvent.press(getByTestId('choose-photo-button'));
    });

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  it('handles photo selection cancellation', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true });
    
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    await act(async () => {
      fireEvent.press(getByTestId('choose-photo-button'));
    });

    expect(mockRoute.params.onAvatarSelect).not.toHaveBeenCalled();
  });

  it('handles save button press', async () => {
    const mockImage = {
      assets: [{
        uri: 'file://test.jpg',
        width: 100,
        height: 100
      }]
    };
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImage);
    
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    await act(async () => {
      fireEvent.press(getByTestId('choose-photo-button'));
    });

    await act(async () => {
      fireEvent.press(getByTestId('save-button'));
    });

    expect(mockRoute.params.onAvatarSelect).toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('handles cancel button press', () => {
    const { getByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    fireEvent.press(getByTestId('cancel-button'));
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows loading indicator during image upload', async () => {
    const mockImage = {
      assets: [{
        uri: 'file://test.jpg',
        width: 100,
        height: 100
      }]
    };
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImage);
    
    const { getByTestId, queryByTestId } = render(<AvatarScreen {...defaultProps} />);
    
    expect(queryByTestId('loading-indicator')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('choose-photo-button'));
    });

    await act(async () => {
      fireEvent.press(getByTestId('save-button'));
    });

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
