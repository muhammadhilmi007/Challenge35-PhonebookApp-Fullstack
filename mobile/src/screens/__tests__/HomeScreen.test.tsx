import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HomeScreen from '../HomeScreen';

const mockStore = configureStore([thunk]);

describe('HomeScreen', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      contacts: {
        contacts: [
          {
            id: 1,
            name: 'John Doe',
            phone: '123-456-7890',
          },
          {
            id: 2,
            name: 'Jane Smith',
            phone: '098-765-4321',
          },
        ],
        loading: false,
        error: null,
      },
    });
  });

  it('renders correctly', () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    expect(getByTestId('search-bar')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('filters contacts when searching', () => {
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'John');

    expect(getByText('John Doe')).toBeTruthy();
    expect(queryByText('Jane Smith')).toBeNull();
  });

  it('navigates to add contact screen when FAB is pressed', () => {
    const mockNavigate = jest.fn();
    const { getByTestId } = render(
      <Provider store={store}>
        <HomeScreen navigation={{ navigate: mockNavigate }} />
      </Provider>
    );

    fireEvent.press(getByTestId('add-contact-fab'));
    expect(mockNavigate).toHaveBeenCalledWith('AddContact');
  });

  it('shows loading indicator when loading contacts', () => {
    const loadingStore = mockStore({
      contacts: {
        contacts: [],
        loading: true,
        error: null,
      },
    });

    const { getByTestId } = render(
      <Provider store={loadingStore}>
        <HomeScreen />
      </Provider>
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
