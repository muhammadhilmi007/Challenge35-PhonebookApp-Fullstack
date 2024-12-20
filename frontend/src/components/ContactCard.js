import React, { useState } from 'react';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';

const ContactCard = ({ contact, onEdit, onDelete, onAvatarUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone
  });

  const handleSave = async () => {
    try {
      await onEdit(contact.id, form);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      onDelete(contact.id);
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleAvatarClick = () => {
    onAvatarUpdate(contact.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="contact-card">
      <div className="avatar" onClick={handleAvatarClick}>
        <img src={contact.photo || '/default-avatar.png'} alt={contact.name} />
      </div>
      <div className="contact-info">
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="edit-input"
              placeholder="Name"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="edit-input"
            />
            <div className="edit-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="contact-details">
              <h3>{contact.name}</h3>
              <p>{contact.phone}</p>
            </div>
            <div className="contact-actions">
              <button onClick={() => setIsEditing(true)} aria-label="Edit contact">
                <BsPencilSquare />
              </button>
              <button onClick={handleDelete} aria-label="Delete contact">
                <BsTrash />
              </button>
            </div>
          </>
        )}
      </div>
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <p>Are you sure you want to delete this contact?</p>
            <div className="confirm-buttons">
              <button onClick={confirmDelete}>Yes</button>
              <button onClick={() => setShowConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactCard;