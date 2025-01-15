/**
 * ContactList Component
 *
 * Displays a list of contacts with infinite scrolling functionality.
 * Features:
 * - Infinite scroll loading
 * - Empty state handling
 * - Contact card rendering
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onAvatarUpdate - Callback for updating contact avatar
 */

import React, { useEffect, useRef } from "react";
// Components
import ContactCard from "./ContactCard";
// Context
import { useContactContext } from "../contexts/ContactContext";

const ContactList = ({ onAvatarUpdate }) => {
  // Context
  const {
    state,
    loadContacts,
    handleEdit,
    handleDelete,
    handleResendSuccess,
    handleRefreshContacts,
  } = useContactContext();

  // Ref for infinite scroll
  const lastContactRef = useRef();

  /**
   * Setup infinite scroll observer
   * Triggers loadContacts when last contact becomes visible
   */
  useEffect(() => {
    if (!lastContactRef.current) return;

    const observerOptions = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && state.hasMore) {
        loadContacts(true);
      }
    }, observerOptions);

    observer.observe(lastContactRef.current);

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [state.hasMore, loadContacts]);

  /**
   * Render empty state when no contacts are available
   */
  if (!state.contacts.length) {
    return (
      <div className="contact-list-empty" role="status">
        <p>No contacts available</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {/* Contact Cards */}
      {state.contacts.map((contact, index) => (
        <div
          ref={index === state.contacts.length - 1 ? lastContactRef : null}
          className={`contact-list-item ${
            contact.status === "pending" ? "pending" : ""
          }`}
        >
          <ContactCard
            key={contact.id}
            no={index + 1}
            contact={contact}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAvatarUpdate={onAvatarUpdate}
            onResendSuccess={handleResendSuccess}
            onRefreshContacts={handleRefreshContacts}
          />
        </div>
      ))}

      {/* Loading State */}
      {state.hasMore && (
        <div className="loading-more" role="status">
          Loading more...
        </div>
      )}
    </div>
  );
};

export default ContactList;
