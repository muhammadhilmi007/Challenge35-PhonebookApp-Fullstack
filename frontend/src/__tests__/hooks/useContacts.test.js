import { renderHook, act } from '@testing-library/react';
import useContacts from '../../hooks/useContacts';
import { api } from '../../services/api';

// Mock the API
jest.mock('../../services/api');

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('useContacts', () => {
  const mockContacts = [
    { id: 1, name: 'John Doe', phone: '123456789', photo: null },
    { id: 2, name: 'Jane Smith', phone: '987654321', photo: null }
  ];

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    api.getContacts.mockReset();
    mockSessionStorage.getItem.mockReset();
    mockSessionStorage.setItem.mockReset();
    mockSessionStorage.clear.mockReset();
  });

  it('should load contacts on initial render', async () => {
    mockSessionStorage.getItem.mockReturnValue('');
    
    api.getContacts.mockResolvedValueOnce({
      phonebooks: mockContacts,
      page: 1,
      pages: 2,
      total: 10
    });

    const { result } = renderHook(() => useContacts());

    expect(result.current.loading).toBe(true);

    // Wait for the async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.contacts).toEqual(mockContacts);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith('contactSearch');
  });

  it('should handle errors', async () => {
    mockSessionStorage.getItem.mockReturnValue('');
    
    const errorMessage = 'Failed to fetch';
    api.getContacts.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useContacts());

    // Wait for the async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('should load more contacts when loadMore is called', async () => {
    mockSessionStorage.getItem.mockReturnValue('');
    
    const firstPage = {
      phonebooks: mockContacts.slice(0, 1),
      page: 1,
      pages: 2,
      total: 2
    };

    const secondPage = {
      phonebooks: mockContacts.slice(1),
      page: 2,
      pages: 2,
      total: 2
    };

    api.getContacts
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    const { result } = renderHook(() => useContacts());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.contacts).toEqual([mockContacts[0]]);

    // Call loadMore
    await act(async () => {
      result.current.loadMore();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.contacts).toEqual(mockContacts);
  });

  it('should update search and reload contacts', async () => {
    mockSessionStorage.getItem.mockReturnValue('');
    
    const searchResults = {
      phonebooks: [mockContacts[0]],
      page: 1,
      pages: 1,
      total: 1
    };

    api.getContacts.mockResolvedValueOnce(searchResults);

    const { result } = renderHook(() => useContacts());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Update search
    await act(async () => {
      result.current.setSearch('John');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('contactSearch', 'John');
    expect(result.current.search).toBe('John');
  });
});