import React, { useState } from 'react';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';

export default function ContactCard({ contact, onEdit, onDelete, onAvatarUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone
  });

  async function saveChanges() {
    if (!form.name.trim() || !form.phone.trim()) return;

    try {
      await onEdit(contact.id, form);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update:', err);
    }
  }

  async function deleteContact() {
    try {
      await onDelete(contact.id);
      setShowDelete(false);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  if (isEditing) {
    return (
      <div className="contact-card">
        <div className="avatar">
          <img src={contact.photo || '/default-avatar.png'} alt={contact.name} />
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
        <img src={contact.photo || '/default-avatar.png'} alt={contact.name} />
      </div>
      <div className="contact-info">
        <div className="contact-details">
          <h3>{contact.name}</h3>
          <p>{contact.phone}</p>
        </div>
        <div className="contact-actions">
          <button onClick={() => setIsEditing(true)} aria-label="Edit contact">
            <BsPencilSquare />
          </button>
          <button onClick={() => setShowDelete(true)} aria-label="Delete contact">
            <BsTrash />
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <p>Delete this contact?</p>
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