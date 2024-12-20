import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

// Mock react-icons components
jest.mock('react-icons/bs', () => ({
  BsFillPersonPlusFill: () => <span data-testid="add-icon">Add Contact</span>,
  BsSearch: () => <span data-testid="search-icon">Search Icon</span>
}));

jest.mock('react-icons/fa', () => ({
  FaSortAlphaUpAlt: () => <span data-testid="sort-up-icon">Sort Up</span>,
  FaSortAlphaDownAlt: () => <span data-testid="sort-down-icon">Sort Down</span>
}));

describe('SearchBar', () => {
  const mockOnChange = jest.fn();
  const mockOnSort = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and buttons', () => {
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );
    
    expect(screen.getByLabelText('Search contacts')).toBeInTheDocument();
    expect(screen.getByTestId('sort-down-icon')).toBeInTheDocument(); // Initial sort state is 'asc'
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
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
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('toggles sort order when sort button is clicked', () => {
    render(
      <SearchBar 
        value=""
        onChange={mockOnChange} 
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );

    const sortButton = screen.getByLabelText('Sort contacts');
    
    // Initial state should show sort-down-icon (asc)
    expect(screen.getByTestId('sort-down-icon')).toBeInTheDocument();
    
    // Click to toggle to desc
    fireEvent.click(sortButton);
    expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');
    
    // Click again to toggle back to asc
    fireEvent.click(sortButton);
    expect(mockOnSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('calls onAdd when add button is clicked', () => {
    render(
      <SearchBar 
        value=""
        onChange={mockOnChange} 
        onSort={mockOnSort}
        onAdd={mockOnAdd}
      />
    );

    const addButton = screen.getByLabelText('Add new contact');
    fireEvent.click(addButton);
    expect(mockOnAdd).toHaveBeenCalled();
  });
});
