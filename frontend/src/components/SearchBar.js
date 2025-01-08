import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

export default function SearchBar({ value = '', onChange, onSort, onAdd }) {
  const [sortOrder, setSortOrder] = useState(
    sessionStorage.getItem('contactSortOrder') || 'asc'
  );

  function toggleSort() {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    sessionStorage.setItem('contactSortOrder', newOrder);
    onSort('name', newOrder);
  }

  return (
    <div className="search-bar">
      <button 
        className="sort-button" 
        onClick={toggleSort}
        aria-label="Sort contacts"
      >
        {sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>

      <div className="search-input-container">
        <BsSearch className="search-icon" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search contacts..."
          aria-label="Search contacts"
        />
      </div>

      <button 
        className="add-button"
        onClick={onAdd}
        aria-label="Add new contact"
      >
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
}