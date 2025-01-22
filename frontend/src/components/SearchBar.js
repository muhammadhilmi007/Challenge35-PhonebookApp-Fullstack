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
 * @param {string} props.value - Search input value
 * @param {Function} props.onChange - Callback for search input changes
 * @param {Function} props.onSort - Callback for sort changes
 */

import React from 'react';
import { useSelector } from 'react-redux';
// Icons
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

const SearchBar = ({ onAdd, value, onChange, onSort }) => {
  // Get sort order from Redux state
  const sortOrder = useSelector(state => state.contacts.sortOrder);

  /**
   * Toggles sort order between ascending and descending
   */
  const handleSortClick = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSort('name', newSortOrder);
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
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