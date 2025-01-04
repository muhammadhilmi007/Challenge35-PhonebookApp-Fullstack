import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={() => {}} />
    );
    
    expect(getByPlaceholderText('Search contacts...')).toBeTruthy();
  });

  it('calls onChangeText when text input changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeTextMock} />
    );

    const searchInput = getByPlaceholderText('Search contacts...');
    fireEvent.changeText(searchInput, 'John');

    expect(onChangeTextMock).toHaveBeenCalledWith('John');
  });

  it('displays the correct value', () => {
    const { getByDisplayValue } = render(
      <SearchBar value="John" onChangeText={() => {}} />
    );

    expect(getByDisplayValue('John')).toBeTruthy();
  });
});
