import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import AddContactScreen from '../AddContactScreen';
import { createMockStore } from '../../test/mocks/store';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

const mockNavigation: Partial<NativeStackNavigationProp<RootStackParamList, 'AddContact'>> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
};

jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  return {
    ...reactNative,
    Alert: {
      ...reactNative.Alert,
      alert: jest.fn(),
    },
  };
});

describe('AddContactScreen', () => {
  let store: ReturnType<typeof createMockStore>;

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

  const renderComponent = () => {
    return render(
      <NavigationContainer>
        <Provider store={store}>
          <AddContactScreen navigation={mockNavigation as NativeStackNavigationProp<RootStackParamList, 'AddContact'>} />
        </Provider>
      </NavigationContainer>
    );
  };

  it('renders form fields correctly', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Phone')).toBeTruthy();
    expect(getByText('Add Contact')).toBeTruthy();
  });

  it('validates required fields', () => {
    const { getByText } = renderComponent();

    const addButton = getByText('Add Contact');
    fireEvent.press(addButton);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Name and phone number are required');
  });

  it('submits form with valid data', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    const nameInput = getByPlaceholderText('Name');
    const phoneInput = getByPlaceholderText('Phone');
    const addButton = getByText('Add Contact');

    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.changeText(phoneInput, '123-456-7890');
    fireEvent.press(addButton);

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('shows loading indicator when submitting', () => {
    store = createMockStore({
      contacts: {
        contacts: [],
        loading: true,
        error: null,
      },
    });

    const { getByTestId } = renderComponent();

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
