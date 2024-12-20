// Mock API responses
const mockContacts = [
  { id: 1, name: 'John Doe', phone: '123456789', photo: '/avatar1.jpg' },
  { id: 2, name: 'Jane Smith', phone: '987654321', photo: '/avatar2.jpg' }
];

export const api = {
  getContacts: jest.fn(async (page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search = '') => {
    return {
      phonebooks: mockContacts,
      page: page,
      pages: 2,
      total: mockContacts.length
    };
  }),

  getContactById: jest.fn(async (id) => {
    const contact = mockContacts.find(c => c.id === id);
    if (!contact) throw new Error('Contact not found');
    return contact;
  }),

  addContact: jest.fn(async (contact) => {
    const newContact = {
      id: mockContacts.length + 1,
      ...contact,
      photo: null
    };
    mockContacts.push(newContact);
    return newContact;
  }),

  updateContact: jest.fn(async (id, updates) => {
    const index = mockContacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    mockContacts[index] = {
      ...mockContacts[index],
      ...updates
    };
    return mockContacts[index];
  }),

  deleteContact: jest.fn(async (id) => {
    const index = mockContacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    mockContacts.splice(index, 1);
    return { message: 'Contact deleted successfully' };
  }),

  updateAvatar: jest.fn(async (id, formData) => {
    const index = mockContacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    mockContacts[index] = {
      ...mockContacts[index],
      photo: '/updated-avatar.jpg'
    };
    return mockContacts[index];
  })
};

// Helper to reset all mocks
export const resetMocks = () => {
  Object.values(api).forEach(mock => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
};

// Helper to clear mock data
export const clearMockData = () => {
  mockContacts.length = 0;
  mockContacts.push(
    { id: 1, name: 'John Doe', phone: '123456789', photo: '/avatar1.jpg' },
    { id: 2, name: 'Jane Smith', phone: '987654321', photo: '/avatar2.jpg' }
  );
};
