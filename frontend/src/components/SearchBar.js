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
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// Icons
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";
// Redux
import { updateSearch, updateSort } from '../redux/contactActions';
import { loadContacts } from '../redux/contactThunks';
import { selectSortOrder, selectSearch } from '../redux/contactReducer';

const SearchBar = () => {
  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const sortOrder = useSelector(selectSortOrder);
  const searchValue = useSelector(selectSearch);
  const [searchInput, setSearchInput] = useState(searchValue);

  // Update search input when Redux state changes
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  /**
   * Toggles sort order between ascending and descending
   */
  const handleSortClick = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(updateSort('name', newSortOrder));
    dispatch(loadContacts(false));
  };

  /**
   * Handles search input changes with debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchValue) {
        dispatch(updateSearch(searchInput));
        if (searchInput) {
          sessionStorage.setItem('contactSearch', searchInput);
          sessionStorage.setItem('searchActive', 'true');
        } else {
          sessionStorage.removeItem('contactSearch');
          sessionStorage.removeItem('searchActive');
        }
        dispatch(loadContacts(false));
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInput, dispatch, searchValue]);

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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search contacts"
        />
      </div>

      {/* Add Contact Button */}
      <button 
        className="add-button" 
        onClick={() => navigate('/add')}
        aria-label="Add new contact"
      >
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
};

export default SearchBar;