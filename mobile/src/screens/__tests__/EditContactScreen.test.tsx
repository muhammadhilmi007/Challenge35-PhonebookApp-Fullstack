import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import EditContactScreen from '../EditContactScreen';
import { createMockStore, RootState } from '../../test/mocks/store';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Alert } from 'react-native';

jest.mock('react-native-vector-icons/Ionicons', () => ({
  name: 'ionicons',
  size: 24,
  color: 'black',
  onPress: jest.fn(),
}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: () => ({
    getConstants: () => ({
      settings: {
        AppleLocale: 'en_US',
        AppleLanguages: ['en'],
      }
    }),
  }),
  getEnforcing: () => ({
    getConstants: () => ({
      settings: {
        AppleLocale: 'en_US',
        AppleLanguages: ['en'],
      }
    }),
  }),
}));

jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  return {
    ...reactNative,
    NativeModules: {
      ...reactNative.NativeModules,
      SettingsManager: {
        settings: {
          AppleLocale: 'en_US',
          AppleLanguages: ['en'],
        }
      },
    },
    Settings: {
      get: jest.fn(),
      set: jest.fn(),
      watchKeys: jest.fn(),
      clearWatch: jest.fn(),
    },
    Alert: {
      ...reactNative.Alert,
      alert: jest.fn(),
    },
  };
});

describe('EditContactScreen', () => {
  let store: ReturnType<typeof createMockStore>;
  const mockContact = {
    id: 1,
    name: 'John Doe',
    phone: '123-456-7890',
  };

  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(),
    canGoBack: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    navigateDeprecated: jest.fn(),
    preload: jest.fn(),
    setStateForNextRouteNamesChange: jest.fn(),
    setOptions: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    popTo: jest.fn()
  } as const;

  beforeEach(() => {
    store = createMockStore({
      contacts: {
        contacts: [],
        loading: false,
        error: null,
      },
    });
    store.dispatch = jest.fn();
    jest.clearAllMocks();
  });

  it('renders form with existing contact data', () => {
    const { getByDisplayValue, getByText } = render(
      <Provider store={store}>
        <EditContactScreen
          route={{
            key: 'edit-contact-key',
            name: 'EditContact',
            params: { contact: mockContact }
          }} navigation={mockNavigation}        />
      </Provider>
    );

    expect(getByDisplayValue('John Doe')).toBeTruthy();
    expect(getByDisplayValue('123-456-7890')).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('validates required fields', () => {
    const { getByDisplayValue, getByText } = render(
      <Provider store={store}>
        <EditContactScreen
          route={{
            key: 'edit-contact-key',
            name: 'EditContact',
            params: { contact: mockContact }
          }} navigation={mockNavigation}        />
      </Provider>
    );

    const nameInput = getByDisplayValue('John Doe');
    fireEvent.changeText(nameInput, '');
    
    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Name and phone number are required');
  });

  it('submits form with updated data', () => {
    const { getByDisplayValue, getByText } = render(
      <Provider store={store}>
        <EditContactScreen
          route={{
            key: 'edit-contact-key',
            name: 'EditContact',
            params: { contact: mockContact }
          }} navigation={mockNavigation}        />
      </Provider>
    );

    const nameInput = getByDisplayValue('John Doe');
    fireEvent.changeText(nameInput, 'John Smith');
    
    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('shows loading indicator when submitting', () => {
    const loadingStore = createMockStore({
      contacts: {
        contacts: [],
        loading: true,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={loadingStore}>
        <EditContactScreen
          route={{
            key: 'edit-contact-key',
            name: 'EditContact',
            params: { contact: mockContact }
          }} navigation={mockNavigation}        />
      </Provider>
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
