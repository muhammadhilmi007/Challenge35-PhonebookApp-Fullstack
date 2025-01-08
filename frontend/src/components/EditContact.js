// Import React dan useState hook dari 'react'
import React, { useState } from 'react';
// Import api dari file '../services/api'
import { api } from '../services/api';

// Definisikan komponen EditContact sebagai functional component
// Menerima props: contact (data kontak yang akan diedit), onSave (fungsi callback setelah berhasil menyimpan), dan onCancel (fungsi callback untuk membatalkan)
export default function EditContact({ contact, onSave, onCancel }) {
  // 4.3 Membuat form edit dengan data kontak yang ada dalam state
  const [form, setForm] = useState({
    name: contact.name,  // Inisialisasi dengan nama kontak yang ada
    phone: contact.phone // Inisialisasi dengan nomor telepon kontak yang ada
  });
  // 4.4 Mengelola state error untuk validasi
  const [error, setError] = useState('');

  // Fungsi untuk menangani submit form
  async function saveContact(e) {
    // 4.5 Mencegah form submission default
    e.preventDefault(); // Mencegah reload halaman saat form disubmit
    
    // 4.6 Validasi: memastikan nama dan nomor telepon tidak kosong
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required');
      return;
    }

    try {
      // 4.7 Memanggil API untuk memperbarui kontak
      const updated = await api.updateContact(contact.id, form);
      onSave(updated); // Memanggil fungsi callback onSave dengan data kontak yang telah diperbarui
    } catch (err) {
      // 4.8 Menangani error jika terjadi kesalahan saat memperbarui kontak
      setError(err.response?.data?.error || 'Failed to update contact');
    }
  }

  // Render komponen
  return (
    <div className="edit-contact">
      <h2>Edit Contact</h2>
      <form onSubmit={saveContact} className="edit-form">
        {/* Input untuk nama */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Enter name"
            className={error && !form.name.trim() ? 'error' : ''}
          />
        </div>

        {/* Input untuk nomor telepon */}
        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Enter phone number"
            className={error && !form.phone.trim() ? 'error' : ''}
          />
        </div>

        {/* Menampilkan pesan error jika ada */}
        {error && <div className="error-message">{error}</div>}

        {/* Tombol aksi */}
        <div className="form-actions">
          <button type="submit" className="save-button">
            Save
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}