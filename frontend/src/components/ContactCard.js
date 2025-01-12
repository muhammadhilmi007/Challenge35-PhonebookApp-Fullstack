import React, { useState } from 'react';
import { BsPencilSquare, BsTrash, BsArrowRepeat } from 'react-icons/bs';

/**
 * Komponen ContactCard
 * 
 * Menampilkan informasi kontak dalam bentuk card.
 * Menyediakan fitur:
 * - Menampilkan foto profil
 * - Edit kontak
 * - Hapus kontak
 * - Kirim ulang kontak (untuk kontak yang pending)
 * 
 * @param {Object} props
 * @param {Object} props.contact - Data kontak yang akan ditampilkan
 * @param {Function} props.onEdit - Fungsi untuk mengedit kontak
 * @param {Function} props.onDelete - Fungsi untuk menghapus kontak
 * @param {Function} props.onAvatarUpdate - Fungsi untuk mengupdate avatar
 * @param {Function} props.onResend - Fungsi untuk mengirim ulang kontak pending
 */
export default function ContactCard({ contact, onEdit, onDelete, onAvatarUpdate, onResend }) {
  // ==================== State Management ====================
  
  /**
   * States untuk mengelola UI
   */
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  
  /**
   * State untuk form edit
   */
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone
  });

  // ==================== Event Handlers ====================

  /**
   * Menyimpan perubahan data kontak
   */
  const saveChanges = async () => {
    // Validasi input
    if (!form.name.trim() || !form.phone.trim()) return;

    try {
      await onEdit(contact.id, form);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update:', err);
    }
  }

  /**
   * Menghapus kontak
   */
  const deleteContact = async () => {
    try {
      await onDelete(contact.id);
      setShowDelete(false);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  // ==================== Render ====================

  // Tampilan mode edit
  if (isEditing) {
    return (
      <div className="contact-card">
        <div className="avatar">
          <img src={contact.photo || '/default-avatar.png'} alt={contact.name} />
        </div>
        <div className="contact-info">
          <div className="edit-form">
            {/* Input nama */}
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="edit-input"
            />
            {/* Input nomor telepon */}
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="edit-input"
            />
            {/* Tombol aksi */}
            <div className="edit-buttons">
              <button onClick={saveChanges}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan normal
  return (
    <div className="contact-card">
      {/* Avatar */}
      <div className="avatar" onClick={() => onAvatarUpdate(contact.id)}>
        <img src={contact.photo || '/default-avatar.png'} alt={contact.name} />
      </div>

      {/* Informasi kontak */}
      <div className="contact-info">
        <div className="contact-details">
          <h3>{contact.name}</h3>
          <p>{contact.phone}</p>
          {contact.status === 'pending' && <span className="pending-badge">Pending</span>}
        </div>

        {/* Tombol aksi */}
        <div className="contact-actions">
          {contact.status === 'pending' ? (
            <button onClick={() => onResend(contact)} aria-label="Resend contact">
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

      {/* Dialog konfirmasi hapus */}
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