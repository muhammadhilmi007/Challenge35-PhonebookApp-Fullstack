import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

const SearchBar = ({ value, onChange, onSort, onAdd }) => {
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    onSort('name', newSortOrder);
  };

  return (
    <div className="search-bar">
      <button onClick={handleSort} className="sort-button">
        {sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>
      <div className="search-input-container">
        <BsSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={value}
          onChange={(e) => {
            const searchValue = e.target.value;
            onChange(searchValue);
          }}
          onKeyUp={(e) => {
            const searchValue = e.target.value;
            onChange(searchValue);
          }}
        />
      </div>
      <button className="add-button" onClick={onAdd}><BsFillPersonPlusFill /></button>
    </div>
  );
};

export default SearchBar;