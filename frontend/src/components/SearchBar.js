/**
 * SearchBar Component
 * 
 * A reusable search bar component that provides search and sort functionality for contacts.
 * Features:
 * - Search input with icon
 * - Sort toggle button (ascending/descending)
 * - Add contact button
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onAdd - Callback function to handle adding new contacts
 */

import React from 'react';
// Icons
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";
// Context
import { useContactContext } from '../contexts/ContactContext';

const SearchBar = ({ onAdd }) => {
  // Context and state
  const { state: contextState, handleSearch, handleSort } = useContactContext();

  /**
   * Toggles sort order between ascending and descending
   */
  const handleSortClick = () => {
    const newSortOrder = contextState.sortOrder === 'asc' ? 'desc' : 'asc';
    handleSort('name', newSortOrder);
  };

  return (
    <div className="search-bar">
      {/* Sort Toggle Button */}
      <button 
        onClick={handleSortClick} 
        className="sort-button"
        aria-label={`Sort ${contextState.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {contextState.sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>

      {/* Search Input */}
      <div className="search-input-container">
        <BsSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={contextState.search}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search contacts"
        />
      </div>

      {/* Add Contact Button */}
      <button 
        className="add-button" 
        onClick={onAdd}
        aria-label="Add new contact"
      >
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
};

export default SearchBar;