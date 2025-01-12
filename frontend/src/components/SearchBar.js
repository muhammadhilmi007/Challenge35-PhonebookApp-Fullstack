import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

/**
 * Komponen SearchBar
 * 
 * Menyediakan fitur pencarian dan pengurutan kontak.
 * Termasuk tombol untuk menambah kontak baru.
 * 
 * @param {Object} props
 * @param {string} props.value - Nilai pencarian saat ini
 * @param {Function} props.onChange - Handler untuk perubahan nilai pencarian
 * @param {Function} props.onSort - Handler untuk perubahan pengurutan
 * @param {Function} props.onAdd - Handler untuk menambah kontak baru
 */
export default function SearchBar({ 
  value = '', 
  onChange, 
  onSort, 
  onAdd 
}) {
  // ==================== State Management ====================
  
  /**
   * State untuk mengatur urutan pengurutan (asc/desc)
   * Nilai disimpan di sessionStorage untuk persistensi
   */
  const [sortOrder, setSortOrder] = useState(
    sessionStorage.getItem('contactSortOrder') || 'asc'
  );

  // ==================== Event Handlers ====================

  /**
   * Mengubah urutan pengurutan antara ascending dan descending
   */
  function toggleSort() {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    sessionStorage.setItem('contactSortOrder', newOrder);
    onSort('name', newOrder);
  }

  // ==================== Render ====================

  return (
    <div className="search-bar">
      {/* Tombol pengurutan */}
      <button 
        className="sort-button" 
        onClick={toggleSort}
        aria-label="Sort contacts"
      >
        {sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>

      {/* Input pencarian */}
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

      {/* Tombol tambah kontak */}
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