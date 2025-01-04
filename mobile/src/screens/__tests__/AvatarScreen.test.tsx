import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import AvatarScreen from '../AvatarScreen';

const mockStore = configureStore([thunk]);

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://mock-image.jpg' }],
  }),
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://mock-camera.jpg' }],
  }),
  MediaTypeOptions: {
    Images: 'Images',
  },
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

describe('AvatarScreen', () => {
  let store;
  const mockContact = {
    id: 1,
    name: 'John Doe',
    phone: '123-456-7890',
    avatar: null,
  };

  beforeEach(() => {
    store = mockStore({
      contacts: {
        loading: false,
        error: null,
      },
    });
    store.dispatch = jest.fn();
  });

  it('renders avatar options correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <AvatarScreen
          route={{ params: { contact: mockContact } }}
        />
      </Provider>
    );

    expect(getByText('Choose from gallery')).toBeTruthy();
    expect(getByText('Take a photo')).toBeTruthy();
  });

  it('handles gallery image selection', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AvatarScreen
          route={{ params: { contact: mockContact } }}
        />
      </Provider>
    );

    const galleryButton = getByText('Choose from gallery');
    await fireEvent.press(galleryButton);

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('handles camera capture', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AvatarScreen
          route={{ params: { contact: mockContact } }}
        />
      </Provider>
    );

    const cameraButton = getByText('Take a photo');
    await fireEvent.press(cameraButton);

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('shows loading indicator when processing', () => {
    const loadingStore = mockStore({
      contacts: {
        loading: true,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={loadingStore}>
        <AvatarScreen
          route={{ params: { contact: mockContact } }}
        />
      </Provider>
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
