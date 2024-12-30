import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import HomeScreen from '../HomeScreen';

const mockStore = configureStore([]);

describe('HomeScreen', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      contacts: {
        contacts: [],
        loading: false,
        error: null,
        hasMore: true,
        page: 1
      }
    });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('handles search input correctly', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    const searchInput = getByPlaceholderText('Search contacts...');
    fireEvent.changeText(searchInput, 'John');
    
    // Verify that the search action was dispatched
    const actions = store.getActions();
    expect(actions).toContainEqual(expect.objectContaining({
      type: 'contacts/searchContacts'
    }));
  });

  it('loads more contacts when scrolling to bottom', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <HomeScreen />
      </Provider>
    );

    const flatList = getByTestId('contacts-list');
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { y: 500 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 }
      }
    });

    // Verify that the load more action was dispatched
    const actions = store.getActions();
    expect(actions).toContainEqual(expect.objectContaining({
      type: 'contacts/loadMoreContacts'
    }));
  });
});
