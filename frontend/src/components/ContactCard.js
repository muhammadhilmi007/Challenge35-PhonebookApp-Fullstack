import React, { useState } from 'react';
import { api } from '../services/api';
import AvatarUpload from './AvatarUpload';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';

const ContactCard = ({ contact, onEdit, onDelete, onAvatarUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
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
      await api.deleteContact(contact.id);
      onDelete(contact.id);
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarUpload(true);
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
          <>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="edit-input"
            />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="edit-input"
            />
          </>
        ) : (
          <>
            <h3>{contact.name}</h3>
            <p>{contact.phone}</p>
          </>
        )}
      </div>

      <div className="contact-actions">
        {isEditing ? (
          <button onClick={handleSave} className="save-icon">✓</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="edit-icon">
            <BsPencilSquare />
          </button>
        )}
        <button onClick={handleDelete} className="delete-icon">
          <BsTrash />
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this contact?</p>
          <div className="confirm-actions">
            <button onClick={confirmDelete} className="confirm-yes">Yes</button>
            <button onClick={() => setShowConfirm(false)} className="confirm-no">No</button>
          </div>
        </div>
      )}

      {showAvatarUpload && (
        <AvatarUpload
          contactId={contact.id}
          currentAvatar={contact.photo}
          onUpdate={onAvatarUpdate}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}
    </div>
  );
};

export default ContactCard;