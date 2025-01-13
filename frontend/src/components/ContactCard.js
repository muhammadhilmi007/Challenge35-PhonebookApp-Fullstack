import React, { useState } from "react";
import { BsPencilSquare, BsTrash, BsArrowRepeat } from "react-icons/bs";
import { api } from "../services/api";
import { localStorageUtil } from "../services/localStorage";
import "../styles/styles.css";

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  onAvatarUpdate,
  onResendSuccess,
  onRefreshContacts
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone,
    photo: contact.photo // Preserve photo in form state
  });

  const handleResend = async () => {
    try {
      const isAvailable = await localStorageUtil.isServerAvailable();
      if (!isAvailable) {
        alert("Server is not available. Please try again later.");
        return;
      }

      // Try to save to server
      const savedContact = await api.addContact({
        name: contact.name,
        phone: contact.phone,
        photo: contact.photo // Include photo when resending
      });

      // Remove from pending contacts
      localStorageUtil.removePendingContact(contact.id);

      // Notify parent component of successful resend
      if (onResendSuccess) {
        await onResendSuccess(contact.id, savedContact);
      }

      // Trigger contacts refresh
      if (onRefreshContacts) {
        onRefreshContacts();
      }
    } catch (error) {
      console.error("Error resending contact:", error);
      alert("Failed to resend contact. Please try again.");
    }
  };

  const saveChanges = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    try {
      // Include photo in the update
      const updatedContact = {
        ...form,
        id: contact.id,
        photo: contact.photo // Ensure photo is included
      };
      await onEdit(contact.id, updatedContact);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const deleteContact = async () => {
    try {
      await onDelete(contact.id);
      setShowDelete(false)
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="contact-card">
        <div className="avatar">
          <img src={contact.photo || '/user-avatar.svg'} alt={contact.name} />
        </div>
        <div className="contact-info">
          <div className="edit-form">
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="edit-input"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="edit-input"
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
      <div className="avatar" onClick={() => onAvatarUpdate(contact.id)}>
        <img src={contact.photo || '/user-avatar.svg'} alt={contact.name} />
      </div>
      <div className="contact-info">
        <div className="contact-details">
          <h3>{contact.name}</h3>
          <p>{contact.phone}</p>
          {contact.status === 'pending' && <span className="pending-badge">Pending</span>}
        </div>
        <div className="contact-actions">
          {contact.status === 'pending' ? (
            <button onClick={handleResend} aria-label="Resend contact">
              <BsArrowRepeat />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} aria-label="Edit contact">
              <BsPencilSquare />
            </button>
          )}
          <button onClick={() => setShowDelete(true)} aria-label="Delete contact">
            <BsTrash />
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="modal-overlay">
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
}