// Komponen ContactList: Menampilkan daftar kontak dengan fitur infinite scrolling

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
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id} // Menggunakan ID kontak
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

/*
Penjelasan:
1. Komponen ContactList bertanggung jawab untuk menampilkan daftar kontak.
2. Menggunakan Intersection Observer API untuk implementasi infinite scrolling.
3. Menampilkan pesan jika tidak ada kontak yang tersedia.
4. Merender setiap kontak menggunakan komponen ContactCard.

Alur dan Logika:
1. Komponen menerima props: contacts, onEdit, onDelete, onAvatarUpdate, onLoadMore, dan hasMore.
2. useEffect digunakan untuk mengatur Intersection Observer.
3. Observer memantau elemen terakhir dalam daftar.
4. Ketika elemen terakhir terlihat dan masih ada kontak lain (hasMore true), onLoadMore dipanggil.
5. Daftar kontak dirender menggunakan map, membuat ContactCard untuk setiap kontak.
6. Jika hasMore true, elemen loading ditampilkan di akhir daftar.

Keterhubungan dengan Backend:
1. Data kontak (contacts) diterima sebagai prop, biasanya diambil dari backend melalui API call.
2. onLoadMore biasanya memicu permintaan ke backend untuk mengambil kontak tambahan.
3. Fungsi onEdit, onDelete, dan onAvatarUpdate umumnya terhubung ke operasi backend untuk memperbarui data kontak.
4. hasMore menunjukkan apakah masih ada data di backend yang belum diambil.

Komponen ini menjembatani antara tampilan frontend dan data dari backend, memungkinkan 
loading data secara bertahap dan interaksi pengguna dengan kontak individual.
*/
