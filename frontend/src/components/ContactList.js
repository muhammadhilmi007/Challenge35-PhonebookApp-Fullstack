import React, { useEffect, useRef } from "react";
import ContactCard from "./ContactCard";

/**
 * Komponen ContactList
 * 
 * Menampilkan daftar kontak dengan fitur infinite scrolling.
 * Menggunakan Intersection Observer untuk memuat lebih banyak kontak
 * saat pengguna mencapai akhir daftar.
 * 
 * @param {Object} props
 * @param {Array} props.contacts - Daftar kontak yang akan ditampilkan
 * @param {Function} props.onEdit - Fungsi untuk mengedit kontak
 * @param {Function} props.onDelete - Fungsi untuk menghapus kontak
 * @param {Function} props.onAvatarUpdate - Fungsi untuk mengupdate avatar
 * @param {Function} props.onResend - Fungsi untuk mengirim ulang kontak pending
 * @param {Function} props.onLoadMore - Fungsi untuk memuat lebih banyak kontak
 * @param {boolean} props.hasMore - Menandakan masih ada kontak yang bisa dimuat
 */
export default function ContactList({ 
  contacts, 
  onEdit, 
  onDelete, 
  onAvatarUpdate, 
  onResend, 
  onLoadMore, 
  hasMore 
}) {
  // ==================== Refs ====================
  
  /**
   * Ref untuk elemen kontak terakhir
   * Digunakan untuk Intersection Observer
   */
  const lastContact = useRef();

  // ==================== Effects ====================

  /**
   * Effect untuk mengatur Intersection Observer
   * Memantau elemen kontak terakhir untuk infinite scrolling
   */
  useEffect(() => {
    // Jangan inisialisasi observer jika tidak ada elemen terakhir
    // atau tidak ada data lagi yang bisa dimuat
    // atau sedang dalam mode offline
    if (!lastContact.current || !hasMore || !navigator.onLine) return;

    // Buat observer untuk memantau elemen terakhir
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, {
      threshold: 0.5 // Trigger saat elemen terlihat 50%
    });

    // Mulai memantau elemen terakhir
    observer.observe(lastContact.current);

    // Cleanup observer saat komponen unmount
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  // ==================== Render ====================

  // Tampilkan pesan jika tidak ada kontak
  if (!contacts || contacts.length === 0) {
    return (
      <div className="contact-list-empty">
        <p>No Contacts Available</p>
      </div>
    );
  }

  // Tampilkan daftar kontak
  return (
    <div className="contact-list">
      {contacts.map((contact, index) => (
        <div 
          key={contact.id} 
          ref={navigator.onLine && index === contacts.length - 1 ? lastContact : null}
          className={`contact-list-item ${contact.status === 'pending' ? 'pending' : ''}`}
        >
          <ContactCard
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
            onAvatarUpdate={onAvatarUpdate}
            onResend={onResend}
          />
        </div>
      ))}
    </div>
  );
}
