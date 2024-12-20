import React, { useEffect, useRef } from 'react';
import ContactCard from './ContactCard';

const ContactList = ({ contacts, onEdit, onDelete, onAvatarUpdate, onLoadMore, hasMore }) => {
  const listRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => {
      if (listRef.current) {
        // eslint-disable-next-line
        observer.unobserve(listRef.current);
      }
    };
  }, [hasMore, onLoadMore]);

  if (!contacts.length) {
    return (
      <div className="contact-list-empty">
        <p>No contacts available</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {contacts.map((contact, index) => (
        <ContactCard
          key={contact.id || `contact-${index}`} // Use index as fallback
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
          onAvatarUpdate={onAvatarUpdate}
        />
      ))}
      {hasMore && <div ref={listRef} className="loading-trigger">Loading more...</div>}
    </div>
  );
};

export default ContactList;
