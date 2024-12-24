// Mengimpor modul yang diperlukan dari React
import React, { useEffect, useRef } from 'react';
// Mengimpor komponen ContactCard
import ContactCard from './ContactCard';

// Mendefinisikan komponen ContactList dengan props yang diperlukan
const ContactList = ({ contacts, onEdit, onDelete, onAvatarUpdate, onLoadMore, hasMore }) => {
  // Membuat ref untuk elemen terakhir dalam daftar
  const listRef = useRef();

  // Menggunakan useEffect untuk menangani infinite scrolling
  useEffect(() => {
    // Membuat Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Jika elemen terakhir terlihat dan masih ada kontak lain untuk dimuat
        if (entries[0].isIntersecting && hasMore) {
          // Memanggil fungsi untuk memuat lebih banyak kontak
          onLoadMore();
        }
      },
      { threshold: 0.5 } // Mengatur threshold ke 50% visibilitas
    );

    // Jika ref elemen terakhir ada, mulai mengamatinya
    if (listRef.current) {
      observer.observe(listRef.current);
    }

    // Membersihkan observer saat komponen di-unmount
    return () => {
      if (listRef.current) {
        // eslint-disable-next-line
        observer.unobserve(listRef.current);
      }
    };
  }, [hasMore, onLoadMore]); // Efek akan dijalankan ulang jika hasMore atau onLoadMore berubah

  // Jika tidak ada kontak, tampilkan pesan
  if (!contacts.length) {
    return (
      <div className="contact-list-empty">
        <p>No contacts available</p>
      </div>
    );
  }

  // Render daftar kontak
  return (
    <div className="contact-list">
      {/* Memetakan setiap kontak ke komponen ContactCard */}
      {contacts.map((contact, index) => (
        <ContactCard
          key={contact.id || `contact-${index}`} // Menggunakan ID kontak atau indeks sebagai key
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
          onAvatarUpdate={onAvatarUpdate}
        />
      ))}
      {/* Jika masih ada kontak lain, tampilkan elemen pemicu loading */}
      {hasMore && <div ref={listRef} className="loading-trigger">Loading more...</div>}
    </div>
  );
};

// Mengekspor komponen ContactList
export default ContactList;
