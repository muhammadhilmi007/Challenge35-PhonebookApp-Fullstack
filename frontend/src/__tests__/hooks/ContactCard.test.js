import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactCard from '../../components/ContactCard';

// Mock react-icons
jest.mock('react-icons/bs', () => ({
  BsPencilSquare: () => <span data-testid="edit-icon">Edit</span>,
  BsTrash: () => <span data-testid="delete-icon">Delete</span>
}));

describe('ContactCard', () => {
  const mockContact = {
    id: 1,
    name: 'John Doe',
    phone: '123456789',
    photo: '/avatar.jpg'
  };

  const mockHandleEdit = jest.fn().mockResolvedValue({});
  const mockHandleDelete = jest.fn().mockResolvedValue({});
  const mockHandleAvatarUpdate = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onAvatarUpdate={mockHandleAvatarUpdate}
      />
    );

    expect(screen.getByText(mockContact.name)).toBeInTheDocument();
    expect(screen.getByText(mockContact.phone)).toBeInTheDocument();
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', mockContact.photo);
    expect(avatar).toHaveAttribute('alt', mockContact.name);
  });

  it('calls edit handler when edit button is clicked', async () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onAvatarUpdate={mockHandleAvatarUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByLabelText('Edit contact'));
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Updated Name' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '987654321' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockHandleEdit).toHaveBeenCalledWith(mockContact.id, {
        name: 'Updated Name',
        phone: '987654321'
      });
    });
  });

  it('calls delete handler when delete is confirmed', async () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onAvatarUpdate={mockHandleAvatarUpdate}
      />
    );

    // Click delete button
    fireEvent.click(screen.getByLabelText('Delete contact'));
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Yes'));
    
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith(mockContact.id);
    });
  });

  it('calls avatar update handler when avatar is clicked', async () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onAvatarUpdate={mockHandleAvatarUpdate}
      />
    );

    fireEvent.click(screen.getByRole('img'));
    
    await waitFor(() => {
      expect(mockHandleAvatarUpdate).toHaveBeenCalledWith(mockContact.id);
    });
  });

  it('cancels edit mode when cancel button is clicked', async () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onAvatarUpdate={mockHandleAvatarUpdate}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByLabelText('Edit contact'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    // Cancel edit
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
    });
  });
});