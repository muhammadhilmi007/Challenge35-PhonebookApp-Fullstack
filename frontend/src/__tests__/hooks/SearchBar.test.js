import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../components/SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();
  const mockOnSort = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange}
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );
    expect(screen.getByLabelText('Search contacts')).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange}
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );
    
    const searchInput = screen.getByLabelText('Search contacts');
    
    // Test incremental changes
    fireEvent.change(searchInput, { target: { value: 'J' } });
    expect(mockOnChange).toHaveBeenCalledWith('J');
    
    fireEvent.change(searchInput, { target: { value: 'Jo' } });
    expect(mockOnChange).toHaveBeenCalledWith('Jo');
    
    fireEvent.change(searchInput, { target: { value: 'Joh' } });
    expect(mockOnChange).toHaveBeenCalledWith('Joh');
    
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(mockOnChange).toHaveBeenCalledWith('John');
  });

  it('calls onSort when sort button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange}
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );
    
    const sortButton = screen.getByLabelText('Sort contacts');
    await user.click(sortButton);
    
    expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('calls onAdd when add button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange}
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );
    
    const addButton = screen.getByLabelText('Add new contact');
    await user.click(addButton);
    
    expect(mockOnAdd).toHaveBeenCalled();
  });
});
