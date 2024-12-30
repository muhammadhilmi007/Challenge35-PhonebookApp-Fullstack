import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EditContactScreen from '../EditContactScreen';

const mockStore = configureStore([]);
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn()
};

const mockRoute = {
  params: {
    contact: {
      id: 1,
      name: 'John Doe',
      phone: '1234567890'
    }
  }
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute
}));

describe('EditContactScreen', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      contacts: {
        loading: false,
        error: null
      }
    });
    store.dispatch = jest.fn();
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <EditContactScreen />
      </Provider>
    );

  it('renders with pre-filled contact information', () => {
    const { getByDisplayValue } = renderComponent();

    expect(getByDisplayValue('John Doe')).toBeTruthy();
    expect(getByDisplayValue('1234567890')).toBeTruthy();
  });

  it('updates input fields when user types', () => {
    const { getByDisplayValue } = renderComponent();

    const nameInput = getByDisplayValue('John Doe');
    const phoneInput = getByDisplayValue('1234567890');

    fireEvent.changeText(nameInput, 'Jane Doe');
    fireEvent.changeText(phoneInput, '0987654321');

    expect(nameInput.props.value).toBe('Jane Doe');
    expect(phoneInput.props.value).toBe('0987654321');
  });

  it('shows validation error for empty name', () => {
    const { getByDisplayValue, getByText, queryByText } = renderComponent();

    const nameInput = getByDisplayValue('John Doe');
    fireEvent.changeText(nameInput, '');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    expect(queryByText('Name is required')).toBeTruthy();
  });

  it('shows validation error for empty phone', () => {
    const { getByDisplayValue, getByText, queryByText } = renderComponent();

    const phoneInput = getByDisplayValue('1234567890');
    fireEvent.changeText(phoneInput, '');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    expect(queryByText('Phone is required')).toBeTruthy();
  });

  it('dispatches updateContact action when form is valid', () => {
    const { getByDisplayValue, getByText } = renderComponent();

    const nameInput = getByDisplayValue('John Doe');
    const phoneInput = getByDisplayValue('1234567890');

    fireEvent.changeText(nameInput, 'Jane Doe');
    fireEvent.changeText(phoneInput, '0987654321');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'contacts/updateContact',
        payload: expect.objectContaining({
          id: 1,
          name: 'Jane Doe',
          phone: '0987654321'
        })
      })
    );
  });

  it('navigates back when cancel is pressed', () => {
    const { getByText } = renderComponent();

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('navigates back after successful update', () => {
    const { getByText } = renderComponent();

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    // Simulate successful update
    store.dispatch.mockImplementationOnce((action) => {
      if (action.type === 'contacts/updateContact') {
        action.payload.onSuccess?.();
      }
    });

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
