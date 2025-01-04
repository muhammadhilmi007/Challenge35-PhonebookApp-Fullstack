// Impor modul yang diperlukan
import React, { useState } from 'react';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';

// Komponen ContactCard menerima props contact, onEdit, onDelete, dan onAvatarUpdate
const ContactCard = ({ contact, onEdit, onDelete, onAvatarUpdate }) => {
  // 4.1 Menginisialisasi state untuk mode edit
  const [isEditing, setIsEditing] = useState(false);
  // State untuk mengontrol tampilan konfirmasi hapus
  const [showConfirm, setShowConfirm] = useState(false);
  // 4.2 Menyiapkan form data dengan nilai kontak saat ini
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone
  });

  // Fungsi untuk menyimpan perubahan saat mengedit
  const handleSave = async () => {
    try {
      // Memanggil fungsi onEdit yang diterima dari props
      await onEdit(contact.id, form);
      // Menonaktifkan mode edit setelah berhasil menyimpan
      setIsEditing(false);
    } catch (error) {
      console.log('Error updating contact:', error);
    }
  };

  // Fungsi untuk menampilkan konfirmasi hapus
  const handleDelete = () => {
    setShowConfirm(true);
  };

  // Fungsi untuk mengkonfirmasi dan melakukan penghapusan
  const confirmDelete = async () => {
    try {
      // Memanggil fungsi onDelete yang diterima dari props
      await onDelete(contact.id);
    } catch (error) {
      console.log('Error deleting contact:', error);
    } finally {
      // Menutup dialog konfirmasi setelah selesai
      setShowConfirm(false);
    }
  };

  // Fungsi untuk menangani klik pada avatar
  const handleAvatarClick = () => {
    onAvatarUpdate(contact.id);
  };

  // Fungsi untuk menangani perubahan input saat mengedit
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Render komponen
  return (
    <div className="contact-card">
      {/* Bagian avatar */}
      <div className="avatar" onClick={handleAvatarClick}>
        <img src={contact.photo || '/default-avatar.png'} alt={contact.name} />
      </div>
      <div className="contact-info">
        {/* Tampilan berbeda untuk mode edit dan mode tampilan */}
        {isEditing ? (
          // Form edit
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
          // Tampilan normal
          <>
            <div className="contact-details">
              <h3>{contact.name}</h3>
              <p>{contact.phone}</p>
            </div>
            <div className="contact-actions">
              {/* Tombol untuk Mengaktifkan mode edit */}
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
      {/* Dialog konfirmasi hapus */}
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