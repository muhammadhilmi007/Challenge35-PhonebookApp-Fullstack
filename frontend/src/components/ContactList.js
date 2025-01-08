// Komponen ContactList: Menampilkan daftar kontak dengan fitur infinite scrolling
import React, { useEffect, useRef } from "react";
import ContactCard from "./ContactCard";

export default function ContactList({ contacts, onEdit, onDelete, onAvatarUpdate, onLoadMore, hasMore }) {
  const lastContact = useRef();

  useEffect(() => {
    if (!lastContact.current) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    observer.observe(lastContact.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!contacts.length) {
    return (
      <div className="contact-list-empty">
        <p>No Contacts Available</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {contacts.map((contact, index) => (
        <div key={contact.id} ref={index === contacts.length - 1 ? lastContact : null}>
          <ContactCard
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
            onAvatarUpdate={onAvatarUpdate}
          />
        </div>
      ))}
    </div>
  );
}

/*
Alur Teknis Detail:

Inisialisasi Observer:

* useEffect hook dijalankan saat komponen mount
* Membuat Intersection Observer dengan threshold 0.5 (50% visibility)
* Observasi Elemen:
	+ lastContactRef ditetapkan ke kontak terakhir
	+ Observer mulai memantau elemen tersebut

Deteksi Scroll:

* Observer mendeteksi ketika elemen terakhir visible
* Memeriksa kondisi hasMore sebelum memuat data baru

Load More Mechanism:

* onLoadMore() dipanggil ketika kondisi terpenuhi
* Memicu API call di useContacts hook
* Data baru ditambahkan ke state contacts

Render Cycle:

* Contacts dimap menjadi ContactCard components
* Ref ditetapkan ke elemen terakhir
* UI diupdate dengan data baru

Cleanup:

* Observer dibersihkan saat komponen unmount
* Mencegah memory leak

Optimisasi dan Best Practices:

* Menggunakan useRef untuk referensi DOM stabil
* Implementasi infinite scroll yang efisien
* Cleanup yang proper untuk mencegah memory leaks
* Penggunaan threshold untuk trigger yang tepat
* Penanganan kasus empty state

Alur ini mengikuti prinsip React untuk unidirectional data flow dan component lifecycle management, sambil mengimplementasikan fitur infinite scrolling yang optimal

*/
