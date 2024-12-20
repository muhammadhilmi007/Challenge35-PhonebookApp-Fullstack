import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactList from '../../components/ContactList';

// Mock react-icons
jest.mock('react-icons/bs', () => ({
  BsPencilSquare: () => <span data-testid="edit-icon">Edit</span>,
  BsTrash: () => <span data-testid="delete-icon">Delete</span>
}));

describe('ContactList', () => {
  const mockContacts = [
    { id: 1, name: 'John Doe', phone: '123456789', photo: '/avatar1.jpg' },
    { id: 2, name: 'Jane Smith', phone: '987654321', photo: '/avatar2.jpg' }
  ];

  const mockHandleEdit = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleAvatarUpdate = jest.fn();
  const mockHandleLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders list of contacts', () => {
      render(
        <ContactList
          contacts={mockContacts}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
          onAvatarUpdate={mockHandleAvatarUpdate}
          onLoadMore={mockHandleLoadMore}
          hasMore={false}
        />
      );

      mockContacts.forEach(contact => {
        expect(screen.getByText(contact.name)).toBeInTheDocument();
        expect(screen.getByText(contact.phone)).toBeInTheDocument();
        const avatar = screen.getByAltText(contact.name);
        expect(avatar).toHaveAttribute('src', contact.photo);
      });
    });

    it('renders empty message when no contacts', () => {
      render(
        <ContactList
          contacts={[]}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
          onAvatarUpdate={mockHandleAvatarUpdate}
          onLoadMore={mockHandleLoadMore}
          hasMore={false}
        />
      );

      expect(screen.getByText('No contacts available')).toBeInTheDocument();
    });
  });

  describe('Loading More', () => {
    it('calls onLoadMore when scrolling to bottom', () => {
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      });
      window.IntersectionObserver = mockIntersectionObserver;

      render(
        <ContactList
          contacts={mockContacts}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
          onAvatarUpdate={mockHandleAvatarUpdate}
          onLoadMore={mockHandleLoadMore}
          hasMore={true}
        />
      );

      // Trigger intersection observer callback
      const [observerCallback] = mockIntersectionObserver.mock.calls[0];
      observerCallback([{ isIntersecting: true }]);

      expect(mockHandleLoadMore).toHaveBeenCalled();
    });

    it('does not show loading trigger when hasMore is false', () => {
      render(
        <ContactList
          contacts={mockContacts}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
          onAvatarUpdate={mockHandleAvatarUpdate}
          onLoadMore={mockHandleLoadMore}
          hasMore={false}
        />
      );

      expect(screen.queryByText('Loading more...')).not.toBeInTheDocument();
    });
  });
});
