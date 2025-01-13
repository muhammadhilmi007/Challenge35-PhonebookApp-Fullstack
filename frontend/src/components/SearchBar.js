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

import React, { useState } from 'react';
// Icons
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";
// Context
import { useContactContext } from '../contexts/ContactContext';

const SearchBar = ({ onAdd }) => {
  // Context and state
  const { state, handleSearch, handleSort } = useContactContext();
  const [sortOrder, setSortOrder] = useState(
    sessionStorage.getItem('contactSortOrder') || 'asc'
  );

  /**
   * Toggles sort order between ascending and descending
   * Updates both local state and parent component
   */
  const handleSortClick = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    handleSort('name', newOrder);
  };

  return (
    <div className="search-bar">
      {/* Sort Toggle Button */}
      <button 
        onClick={handleSortClick} 
        className="sort-button"
        aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>

      {/* Search Input */}
      <div className="search-input-container">
        <BsSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={state.search}
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