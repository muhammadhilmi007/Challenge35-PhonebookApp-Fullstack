// Komponen ContactList: Menampilkan daftar kontak dengan fitur infinite scrolling
import React, { useEffect, useRef } from "react";
import ContactCard from "./ContactCard";

const ContactList = ({
  contacts,
  onEdit,
  onDelete,
  onAvatarUpdate,
  onLoadMore,
  hasMore,
}) => {
  const lastContactRef = useRef();

  // 1.5 Setup Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 1.6 Deteksi Scroll
        if (entries[0].isIntersecting && hasMore) {
          // 1.7 Trigger Load More
          onLoadMore();
        }
      },
      { threshold: 1 }
    );

    // 1.8 Observe Last Contact
    if (lastContactRef.current) {
      observer.observe(lastContactRef.current);
    }

    // 1.9 Cleanup
    return () => observer.disconnect();
  }, [lastContactRef, hasMore, onLoadMore]);

  if (!contacts.length) {
    return (
      <div className="contact-list-empty">
        <p>No Contacts Available</p>
      </div>
    );
  }

  // 1.10/3.12 Render Contact List
  return (
    <div className="contact-list">
      {contacts.map((contact, index) => {
        if (contacts.length === index + 1) {
          return (
            <div key={contact.id} ref={lastContactRef}>
              <ContactCard
                contact={contact}
                onEdit={onEdit}
                onDelete={onDelete}
                onAvatarUpdate={onAvatarUpdate}
              />
            </div>
          );
        } else {
          return (
            <div key={contact.id}>
              <ContactCard
                contact={contact}
                onEdit={onEdit}
                onDelete={onDelete}
                onAvatarUpdate={onAvatarUpdate}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

export default ContactList;

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
