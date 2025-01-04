import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  })
}));

// Mock react-icons
jest.mock('react-icons/bs', () => ({
  BsFillPersonPlusFill: () => <span data-testid="add-icon">Add Contact</span>,
  BsSearch: () => <span data-testid="search-icon">Search Icon</span>,
  BsPencilSquare: () => <span data-testid="edit-icon">Edit</span>,
  BsTrash: () => <span data-testid="delete-icon">Delete</span>
}));

jest.mock('react-icons/fa', () => ({
  FaSortAlphaUpAlt: () => <span data-testid="sort-up-icon">Sort Up</span>,
  FaSortAlphaDownAlt: () => <span data-testid="sort-down-icon">Sort Down</span>
}));

// Mock the API
jest.mock('./services/api', () => ({
  api: {
    getContacts: jest.fn().mockResolvedValue({ phonebooks: [], pages: 1 }),
    addContact: jest.fn().mockResolvedValue({}),
    updateContact: jest.fn().mockResolvedValue({}),
    deleteContact: jest.fn().mockResolvedValue({}),
    uploadAvatar: jest.fn().mockResolvedValue({}),
    updateAvatar: jest.fn().mockResolvedValue({}),
    getContactById: jest.fn().mockResolvedValue({
      id: 1,
      name: 'John Doe',
      phone: '123456789',
      photo: '/avatar.jpg'
    })
  }
}));

// Create mock useContacts implementation
const mockUseContactsImplementation = {
  contacts: [],
  loading: false,
  error: null,
  hasMore: false,
  search: '',
  setSearch: jest.fn(),
  setSortBy: jest.fn(),
  setSortOrder: jest.fn(),
  loadMore: jest.fn(),
  refreshContacts: jest.fn(),
  setContacts: jest.fn()
};

// Mock useContacts hook
jest.mock('./hooks/useContacts', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseContactsImplementation)
}));

describe('App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mock implementation
    const { default: useContacts } = require('./hooks/useContacts');
    useContacts.mockImplementation(() => ({
      ...mockUseContactsImplementation,
      contacts: []
    }));
  });

  it('renders the phonebook app', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Check for the main components
    expect(screen.getByPlaceholderText(/search contacts/i)).toBeInTheDocument();
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sort-down-icon')).toBeInTheDocument(); // Initial sort state is 'asc'
  });

  it('handles contact operations', async () => {
    const mockContact = {
      id: 1,
      name: 'John Doe',
      phone: '123456789',
      photo: '/avatar.jpg'
    };

    // Set up mock contacts
    const { default: useContacts } = require('./hooks/useContacts');
    useContacts.mockImplementation(() => ({
      ...mockUseContactsImplementation,
      contacts: [mockContact]
    }));

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Check for contact details
    const nameElement = await screen.findByRole('heading', { name: /john doe/i });
    expect(nameElement).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
  });
});
