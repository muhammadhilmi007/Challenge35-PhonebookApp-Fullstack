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

