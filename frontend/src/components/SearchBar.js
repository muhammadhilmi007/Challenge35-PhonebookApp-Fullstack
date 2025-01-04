import React, { useState } from 'react';
import { BsFillPersonPlusFill, BsSearch } from "react-icons/bs";
import { FaSortAlphaUpAlt, FaSortAlphaDownAlt } from "react-icons/fa";

// Komponen SearchBar dengan props yang diterima
const SearchBar = ({ value = '', onChange, onSort, onAdd }) => {
  // 2.3 State untuk menyimpan urutan pengurutan (asc/desc), diinisialisasi dari sessionStorage (Implementasi UI di SearchBar Component)
  const [sortOrder, setSortOrder] = useState(() => {
    return sessionStorage.getItem('contactSortOrder') || 'asc'; // Default values: sortBy = 'name', sortOrder = 'asc'
  });

  // 2.4 User mengklik tombol sort di SearchBar, dan Ter-trigger Fungsi untuk menangani perubahan urutan pengurutan (Implementasi UI di SearchBar Component)
  const handleSort = () => {
    // 2.5 Icon berubah sesuai arah pengurutan (asc/desc)
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    // 2.6 Update local state dan sessionStorage
    setSortOrder(newSortOrder);
    sessionStorage.setItem('contactSortOrder', newSortOrder);
    // 2.7 Memanggil fungsi onSort dengan parameter nama dan urutan baru
    onSort('name', newSortOrder);
  };

  // 3.3 Menangkap perubahan input dari user
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    // 3.4 Meneruskan nilai ke handler utama
    onChange(newValue);
  };

  // Render komponen
  return (
    <div className="search-bar">
      {/* 2.1 Tombol pengurutan */}
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
      {/* // !! Tombol tambah kontak baru */}
      <button className="add-button" onClick={onAdd} aria-label="Add new contact">
        <BsFillPersonPlusFill />
      </button>
    </div>
  );
};

// Ekspor komponen SearchBar
export default SearchBar;