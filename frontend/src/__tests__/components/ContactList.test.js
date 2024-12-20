import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactList from '../../components/ContactList';

// Mock react-icons
jest.mock('react-icons/bs', () => ({
  BsPencilSquare: () => <span data-testid="edit-icon">Edit</span>,
  BsTrash: () => <span data-testid="delete-icon">Delete</span>
}));

describe('ContactList', () => {
  const mockContacts = [
    {
      id: 1,
      name: 'John Doe',
      phone: '123456789',
      photo: '/avatar1.jpg'
    },
    {
      id: 2,
      name: 'Jane Smith',
      phone: '987654321',
      photo: '/avatar2.jpg'
    }
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAvatarUpdate = jest.fn();
  const mockOnLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact list correctly', () => {
    render(
      <ContactList
        contacts={mockContacts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
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
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={false}
      />
    );

    expect(screen.getByText('No contacts available')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactList
        contacts={mockContacts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    const editIcon = screen.getAllByTestId('edit-icon')[0];
    await user.click(editIcon);

    expect(screen.getByDisplayValue(mockContacts[0].name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockContacts[0].phone)).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(
      <ContactList
        contacts={mockContacts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    const deleteIcon = screen.getAllByTestId('delete-icon')[0];
    await user.click(deleteIcon);

    await user.click(screen.getByRole('button', { name: /yes/i }));
    expect(mockOnDelete).toHaveBeenCalledWith(mockContacts[0].id);
  });

  it('navigates to avatar update page when avatar is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactList
        contacts={mockContacts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    await user.click(screen.getByAltText(mockContacts[0].name));
    expect(mockOnAvatarUpdate).toHaveBeenCalledWith(mockContacts[0].id);
  });

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
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    // Trigger intersection observer callback
    const [observerCallback] = mockIntersectionObserver.mock.calls[0];
    observerCallback([{ isIntersecting: true }]);

    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it('does not show loading trigger when hasMore is false', () => {
    render(
      <ContactList
        contacts={mockContacts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
        onLoadMore={mockOnLoadMore}
        hasMore={false}
      />
    );

    expect(screen.queryByText('Loading more...')).not.toBeInTheDocument();
  });
});
