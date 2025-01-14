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

import React, { useReducer } from 'react';
// Icons
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";
// Context
import { useContactContext } from '../contexts/ContactContext';

const initialState = {
  sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc'
};

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SORT_ORDER':
      return { ...state, sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' };
    default:
      return state;
  }
}

const SearchBar = ({ onAdd }) => {
  // Context and state
  const { state: contextState, handleSearch, handleSort } = useContactContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Toggles sort order between ascending and descending
   * Updates both local state and parent component
   */
  const handleSortClick = () => {
    dispatch({ type: 'TOGGLE_SORT_ORDER' });
    handleSort('name', state.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="search-bar">
      {/* Sort Toggle Button */}
      <button 
        onClick={handleSortClick} 
        className="sort-button"
        aria-label={`Sort ${state.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {state.sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
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