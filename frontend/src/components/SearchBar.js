import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

export default function SearchBar({ value = '', onChange, onSort, onAdd }) {
  const [sortOrder, setSortOrder] = useState(
    sessionStorage.getItem('contactSortOrder') || 'asc'
  );

  function handleSort() {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    onSort('name', newOrder);
  }

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
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <button className="add-button" onClick={onAdd}>
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
}