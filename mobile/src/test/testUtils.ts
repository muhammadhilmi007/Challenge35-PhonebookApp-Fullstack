import { Contact } from '../store/contacts/types';

export const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'John Doe',
    phone: '123-456-7890',
    avatar: null,
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '098-765-4321',
    avatar: 'https://example.com/avatar.jpg',
  },
];

export const mockContact: Contact = {
  id: 1,
  name: 'John Doe',
  phone: '123-456-7890',
  avatar: null,
};

export const mockNewContact = {
  name: 'New Contact',
  phone: '111-222-3333',
};

export const mockFormData = () => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: 'file://mock-image.jpg',
    type: 'image/jpeg',
    name: 'avatar.jpg',
  });
  return formData;
};

export const mockNavigationProps = {
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  },
  route: {
    params: {},
  },
};

export const mockReduxState = {
  contacts: {
    contacts: mockContacts,
    loading: false,
    error: null,
  },
};

export const mockErrorState = {
  contacts: {
    contacts: [],
    loading: false,
    error: 'Something went wrong',
  },
};

export const mockLoadingState = {
  contacts: {
    contacts: [],
    loading: true,
    error: null,
  },
};

export const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

export const simulateAPIError = (message = 'Network Error') => {
  const error = new Error(message);
  error.response = {
    data: { message },
    status: 500,
  };
  return error;
};

export const mockImagePickerResponse = {
  canceled: false,
  assets: [
    {
      uri: 'file://mock-image.jpg',
      type: 'image/jpeg',
      name: 'avatar.jpg',
    },
  ],
};

export const mockCameraResponse = {
  canceled: false,
  assets: [
    {
      uri: 'file://mock-camera.jpg',
      type: 'image/jpeg',
      name: 'camera.jpg',
    },
  ],
};
