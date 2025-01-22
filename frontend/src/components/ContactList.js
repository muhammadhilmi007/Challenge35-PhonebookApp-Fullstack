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
 * @param {Array} props.contacts - List of contacts to display
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.hasMore - Whether there are more contacts to load
 * @param {Function} props.onLoadMore - Callback for loading more contacts
 * @param {Function} props.onEdit - Callback for editing a contact
 * @param {Function} props.onDelete - Callback for deleting a contact
 * @param {Function} props.onAvatarUpdate - Callback for updating contact avatar
 * @param {Function} props.onResendSuccess - Callback for handling resend success
 * @param {Function} props.onRefreshContacts - Callback for refreshing contacts
 */

import React, { useEffect, useRef } from "react";
// Components
import ContactCard from "./ContactCard";

const ContactList = ({
  contacts,
  loading,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
  onAvatarUpdate,
  onResendSuccess,
  onRefreshContacts,
}) => {
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
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    }, observerOptions);

    observer.observe(lastContactRef.current);

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  /**
   * Render empty state when no contacts are available
   */
  if (!contacts.length) {
    return (
      <div className="contact-list-empty" role="status">
        <p>No contacts available</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {/* Contact Cards */}
      {contacts.map((contact, index) => (
        <div
          key={contact.id}
          ref={index === contacts.length - 1 ? lastContactRef : null}
          className={`contact-list-item ${
            contact.status === "pending" ? "pending" : ""
          }`}
        >
          <ContactCard
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
            onAvatarUpdate={onAvatarUpdate}
            onResendSuccess={onResendSuccess}
            onRefreshContacts={onRefreshContacts}
          />
        </div>
      ))}

      {/* Loading State */}
      {hasMore && (
        <div className="loading-more" role="status">
          Loading more...
        </div>
      )}
    </div>
  );
};

export default ContactList;
