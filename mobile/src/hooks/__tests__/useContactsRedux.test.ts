import { renderHook, act } from '@testing-library/react-hooks';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import React from 'react';
import { useContactsRedux } from '../useContactsRedux';
import { RootState } from '../../store';
import { TestWrapper } from '../../test/TestWrapper';

const mockStore = configureMockStore([thunk]);

describe('useContactsRedux', () => {
  let testStore: any;

  beforeEach(() => {
    testStore = mockStore({
      contacts: {
        phonebooks: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null,
        isAppend: false,
      },
    });
    testStore.dispatch = jest.fn();
  });

  it('should return contacts state and actions', () => {
    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });

    const { phonebooks, total, page, pages, loading, error, handleFetchContacts, handleCreateContact, handleEditContact, handleRemoveContact } = result.current;

    expect(phonebooks).toEqual([]);
    expect(total).toBe(0);
    expect(page).toBe(1);
    expect(pages).toBe(1);
    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(typeof handleFetchContacts).toBe('function');
    expect(typeof handleCreateContact).toBe('function');
    expect(typeof handleEditContact).toBe('function');
    expect(typeof handleRemoveContact).toBe('function');
  });

  it('should handle creating a contact', async () => {
    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });
    const newContact = { name: 'John Doe', phone: '123-456-7890' };

    await act(async () => {
      await result.current.createContact(newContact);
    });

    expect(testStore.dispatch).toHaveBeenCalled();
  });

  it('should handle editing a contact', async () => {
    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });
    const updatedContact = { name: 'Jane Doe', phone: '098-765-4321' };

    await act(async () => {
      await result.current.handleEditContact(1, updatedContact);
    });

    expect(testStore.dispatch).toHaveBeenCalled();
  });

  it('should handle removing a contact', async () => {
    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.removeContact(1);
    });

    expect(testStore.dispatch).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    testStore = mockStore({
      contacts: {
        phonebooks: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: true,
        error: null,
        isAppend: false,
      }
    });

    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });
    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    const error = 'Failed to fetch contacts';
    testStore = mockStore({
      contacts: {
        phonebooks: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error,
        isAppend: false,
      }
    });

    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });
    expect(result.current.error).toBe(error);
  });

  it('should handle fetching contacts', async () => {
    const { result } = renderHook(() => useContactsRedux(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.fetchContacts(1, 10, 'name', 'asc', 'John');
    });

    expect(testStore.dispatch).toHaveBeenCalled();
  });
});
