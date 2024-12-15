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

  return (
    <div className="contact-list">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
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