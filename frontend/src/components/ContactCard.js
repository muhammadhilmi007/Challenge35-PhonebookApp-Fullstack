/**
 * ContactCard Component
 * 
 * Displays individual contact information with edit, delete, and avatar update functionality.
 * Features:
 * - Contact information display
 * - Edit mode toggle
 * - Delete confirmation
 * - Pending contact handling
 * - Avatar display and update
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.contact - Contact data object
 * @param {Function} props.onAvatarUpdate - Callback for updating avatar
 * @param {Function} props.handleEdit - Callback for editing contact
 * @param {Function} props.handleDelete - Callback for deleting contact
 * @param {Function} props.handleResendSuccess - Callback for resending pending contact
 * @param {Function} props.handleRefreshContacts - Callback to refresh contact list
 */

import React, { useState } from "react";
// Icons
import { BsPencilSquare, BsTrash, BsArrowRepeat } from "react-icons/bs";
// Services
import { api } from "../services/api";
import { localStorageUtil } from "../services/localStorage";
// Context
import { useContactContext } from "../contexts/ContactContext";
// Styles
import "../styles/styles.css";

const ContactCard = ({ contact, onAvatarUpdate }) => {
  // Context and state
  const { 
    handleEdit, 
    handleDelete, 
    handleResendSuccess, 
    handleRefreshContacts 
  } = useContactContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone,
    photo: contact.photo
  });

  /**
   * Handles resending a pending contact to the server
   * Removes from pending storage if successful
   */
  const handleResend = async () => {
    try {
      const isAvailable = await localStorageUtil.isServerAvailable();
      if (!isAvailable) {
        alert("Server is not available. Please try again later.");
        return;
      }

      const savedContact = await api.addContact({
        name: contact.name,
        phone: contact.phone,
        photo: contact.photo
      });

      localStorageUtil.removePendingContact(contact.id);

      if (handleResendSuccess) {
        await handleResendSuccess(contact.id, savedContact);
      }

      handleRefreshContacts();
    } catch (error) {
      console.error("Error resending contact:", error);
      alert("Failed to resend contact. Please try again.");
    }
  };

  /**
   * Handles saving contact changes
   */
  const saveChanges = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    try {
      const updatedContact = {
        ...form,
        id: contact.id,
        photo: contact.photo
      };
      await handleEdit(contact.id, updatedContact);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  /**
   * Handles contact deletion with confirmation
   */
  const deleteContact = async () => {
    try {
      await handleDelete(contact.id);
      setShowDelete(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Render edit mode
  if (isEditing) {
    return (
      <div className="contact-card">
        {/* Avatar Section */}
        <div className="avatar">
          <img 
            src={contact.photo || '/user-avatar.svg'} 
            alt={contact.name} 
          />
        </div>

        {/* Edit Form */}
        <div className="contact-info">
          <div className="edit-form">
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="edit-input"
              aria-label="Edit contact name"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="edit-input"
              aria-label="Edit contact phone"
            />
            <div className="edit-buttons">
              <button onClick={saveChanges}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-card">
      {/* Avatar Section */}
      <div 
        className="avatar" 
        onClick={() => onAvatarUpdate(contact.id)}
        role="button"
        aria-label="Update avatar"
      >
        <img 
          src={contact.photo || '/user-avatar.svg'} 
          alt={`${contact.name}'s avatar`} 
        />
      </div>

      {/* Contact Information */}
      <div className="contact-info">
        <div className="contact-details">
          <h3>{contact.name}</h3>
          <p>{contact.phone}</p>
          {contact.status === 'pending' && (
            <span className="pending-badge">Pending</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="contact-actions">
          {contact.status === 'pending' ? (
            <button 
              onClick={handleResend} 
              aria-label="Resend contact"
              className="action-button resend"
            >
              <BsArrowRepeat />
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              aria-label="Edit contact"
              className="action-button edit"
            >
              <BsPencilSquare />
            </button>
          )}
          <button 
            onClick={() => setShowDelete(true)} 
            aria-label="Delete contact"
            className="action-button delete"
          >
            <BsTrash />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <p>Are you sure you want to delete this contact?</p>
            <div className="confirm-buttons">
              <button onClick={deleteContact}>Yes</button>
              <button onClick={() => setShowDelete(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactCard;