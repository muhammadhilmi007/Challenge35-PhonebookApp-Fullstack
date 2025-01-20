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
 */

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
// Components
import ContactCard from "./ContactCard";
// Redux
import { loadContacts } from "../redux/contactThunks";
import { selectContacts, selectLoading, selectHasMore } from "../redux/contactReducer";

const ContactList = () => {
  // Hooks
  const dispatch = useDispatch();
  const contacts = useSelector(selectContacts);
  const loading = useSelector(selectLoading);
  const hasMore = useSelector(selectHasMore);

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
        dispatch(loadContacts(true));
      }
    }, observerOptions);

    observer.observe(lastContactRef.current);

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [hasMore, loading, dispatch]);

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
          <ContactCard contact={contact} />
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
