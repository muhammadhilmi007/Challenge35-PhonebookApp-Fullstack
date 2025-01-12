// Komponen ContactList: Menampilkan daftar kontak dengan fitur infinite scrolling
import React, { useEffect, useRef } from "react";
import ContactCard from "./ContactCard";

export default function ContactList({ contacts, onEdit, onDelete, onAvatarUpdate, onResend, onLoadMore, hasMore }) {
  const lastContact = useRef();

  useEffect(() => {
    if (!lastContact.current || !hasMore || !navigator.onLine) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, {
      threshold: 0.5
    });

    observer.observe(lastContact.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!contacts || contacts.length === 0) {
    return (
      <div className="contact-list-empty">
        <p>No Contacts Available</p>
      </div>
    );
  }

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
