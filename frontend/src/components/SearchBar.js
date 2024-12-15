import React, { useState } from 'react';
import { BsFillPersonPlusFill } from "react-icons/bs";
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
      <button onClick={handleSort} className="add-button">
        {sortOrder === 'asc' ? <FaSortAlphaUpAlt /> : <FaSortAlphaDownAlt />}
      </button>
      <input
        type="text"
        placeholder="Search contacts..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="add-button" onClick={onAdd}><BsFillPersonPlusFill /></button>
    </div>
  );
};

export default SearchBar;