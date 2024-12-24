// Impor modul dan komponen yang diperlukan
import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

// Komponen SearchBar dengan props yang diterima
const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
  // State untuk menyimpan urutan pengurutan (asc/desc)
  const [sortOrder, setSortOrder] = useState('asc');

  // Fungsi untuk menangani perubahan urutan pengurutan
  const handleSort = () => {
    // Mengubah urutan pengurutan
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    // Memanggil fungsi onSort dengan parameter nama dan urutan baru
    onSort('name', newSortOrder);
  };

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    // Memanggil fungsi onChange dengan nilai baru
    onChange(newValue);
  };

  // Render komponen
  return (
    <div className="search-bar">
      {/* Tombol pengurutan */}
      <button onClick={handleSort} className="sort-button" aria-label="Sort contacts">
        {/* Menampilkan ikon sesuai dengan urutan pengurutan saat ini */}
        {sortOrder === 'asc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaUpAlt />}
      </button>
      {/* Kontainer input pencarian */}
      <div className="search-input-container">
        {/* Ikon pencarian */}
        <BsSearch className="search-icon" />
        {/* Input pencarian */}
        <input
          type="text"
          placeholder="Search contacts..."
          value={value}
          onChange={handleSearchChange}
          aria-label="Search contacts"
        />
      </div>
      {/* Tombol tambah kontak baru */}
      <button className="add-button" onClick={onAdd} aria-label="Add new contact">
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
};

// Ekspor komponen SearchBar
export default SearchBar;