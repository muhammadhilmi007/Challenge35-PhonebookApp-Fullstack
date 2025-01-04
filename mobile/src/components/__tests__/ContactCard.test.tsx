import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import ContactCard from '../ContactCard';
import { renderWithProviders } from '../../test/test-utils';

const mockContact = {
  id: 1,
  name: 'John Doe',
  phone: '123-456-7890',
  avatar: null,
};

describe('ContactCard', () => {
  it('renders contact information correctly', () => {
    const { getByText } = renderWithProviders(
      <ContactCard
        contact={mockContact}
        onPress={() => {}}
        onDelete={() => {}}
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('123-456-7890')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ContactCard
        contact={mockContact}
        onPress={onPressMock}
        onDelete={() => {}}
      />
    );

    fireEvent.press(getByTestId('contact-card'));
    expect(onPressMock).toHaveBeenCalledWith(mockContact);
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDeleteMock = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ContactCard
        contact={mockContact}
        onPress={() => {}}
        onDelete={onDeleteMock}
      />
    );

    fireEvent.press(getByTestId('delete-button'));
    expect(onDeleteMock).toHaveBeenCalledWith(mockContact.id);
  });
});
