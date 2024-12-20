import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    onSort('name', newSortOrder);
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="search-bar">
      <button onClick={handleSort} className="sort-button" aria-label="Sort contacts">
        {sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>
      <div className="search-input-container">
        <BsSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={value}
          onChange={handleSearchChange}
          aria-label="Search contacts"
        />
      </div>
      <button className="add-button" onClick={onAdd} aria-label="Add new contact">
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
};

export default SearchBar;