import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactCard from '../../components/ContactCard';

// Mock react-icons components
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

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAvatarUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    expect(screen.getByText(mockContact.name)).toBeInTheDocument();
    expect(screen.getByText(mockContact.phone)).toBeInTheDocument();
    const avatar = screen.getByAltText(mockContact.name);
    expect(avatar).toHaveAttribute('src', mockContact.photo);
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    await user.click(screen.getByTestId('edit-icon'));

    expect(screen.getByDisplayValue(mockContact.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockContact.phone)).toBeInTheDocument();
  });

  it('calls onEdit with updated values when save is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    await user.click(screen.getByTestId('edit-icon'));

    const nameInput = screen.getByDisplayValue(mockContact.name);
    const phoneInput = screen.getByDisplayValue(mockContact.phone);

    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');
    await user.clear(phoneInput);
    await user.type(phoneInput, '987654321');

    await user.click(screen.getByText('Save'));

    expect(mockOnEdit).toHaveBeenCalledWith(mockContact.id, {
      name: 'Jane Doe',
      phone: '987654321'
    });
  });

  it('cancels edit mode when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    await user.click(screen.getByTestId('edit-icon'));

    const nameInput = screen.getByDisplayValue(mockContact.name);
    const phoneInput = screen.getByDisplayValue(mockContact.phone);

    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');
    await user.clear(phoneInput);
    await user.type(phoneInput, '987654321');

    await user.click(screen.getByText('Cancel'));

    expect(screen.getByText(mockContact.name)).toBeInTheDocument();
    expect(screen.getByText(mockContact.phone)).toBeInTheDocument();
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    await user.click(screen.getByTestId('delete-icon'));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    await user.click(screen.getByTestId('delete-icon'));
    await user.click(screen.getByText('Yes'));

    expect(mockOnDelete).toHaveBeenCalledWith(mockContact.id);
  });

  it('calls onAvatarUpdate when avatar is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );

    await user.click(screen.getByAltText(mockContact.name));
    expect(mockOnAvatarUpdate).toHaveBeenCalledWith(mockContact.id);
  });
});
