import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';
import React from 'react';
import './mocks/FormData';

// Mock the navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native') as Record<string, any>;
  const navigationConfig = {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
  return {
    ...actualNav,
    ...navigationConfig,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock ActivityIndicator
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => {
      return React.createElement('ActivityIndicator', {
        testID: props.testID,
        ...props,
      });
    },
  };
});

// Mock StyleSheet
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: (styles: Record<string, any>) => styles,
  compose: (style1: any, style2: any) => ({ ...style1, ...style2 }),
  flatten: (style: any) => style,
  setStyleAttributePreprocessor: () => {},
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  render: () => {},
  process: () => {},
}));

// Mock PixelRatio with complete implementation
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => {
  const pixelRatio = {
    get: () => 1,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size: number) => size,
    roundToNearestPixel: (size: number) => size,
    startDetecting: () => {},
  };
  return pixelRatio;
});

// Mock Dimensions API
jest.mock('react-native/Libraries/Utilities/Dimensions', () => require('../test/mocks/Dimensions').default);

// Mock Animated API
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock PushNotificationIOS
jest.mock('react-native/Libraries/PushNotificationIOS/PushNotificationIOS', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve({})),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
}));

// Mock DevSettings
jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  addMenuItem: jest.fn(),
  reload: jest.fn(),
}));

// Mock Keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Add custom matchers
expect.extend({
  toBeValidPhoneNumber(received) {
    const phoneRegex = /^\+?[\d\s-]+$/;
    const pass = phoneRegex.test(received);
    return {
      pass,
      message: () =>
        `expected ${received} to be a valid phone number`,
    };
  },
});
