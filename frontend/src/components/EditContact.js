// Import React dan useState hook dari 'react'
import React, { useState } from 'react';
// Import api dari file '../services/api'
import { api } from '../services/api';

// Definisikan komponen EditContact sebagai functional component
// Menerima props: contact (data kontak yang akan diedit), onSave (fungsi callback setelah berhasil menyimpan), dan onCancel (fungsi callback untuk membatalkan)
const EditContact = ({ contact, onSave, onCancel }) => {
  // State untuk menyimpan data form
  const [form, setForm] = useState({
    name: contact.name,  // Inisialisasi dengan nama kontak yang ada
    phone: contact.phone // Inisialisasi dengan nomor telepon kontak yang ada
  });
  // State untuk menyimpan pesan error
  const [error, setError] = useState('');

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah reload halaman saat form disubmit
    
    // Validasi: memastikan nama dan nomor telepon tidak kosong
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Nama dan nomor telepon harus diisi');
      return;
    }

    try {
      // Memanggil API untuk memperbarui kontak
      const updatedContact = await api.updateContact(contact.id, form);
      onSave(updatedContact); // Memanggil fungsi callback onSave dengan data kontak yang telah diperbarui
    } catch (err) {
      // Menangani error jika terjadi kesalahan saat memperbarui kontak
      setError(err.response?.data?.error || 'Gagal memperbarui kontak');
    }
  };

  // Fungsi untuk menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Memperbarui state form
    setForm(prev => ({ ...prev, [name]: value }));
    // Menghapus pesan error jika ada
    if (error) setError('');
  };

  // Render komponen
  return (
    <div className="edit-contact">
      <h2>Edit Kontak</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        {/* Input untuk nama */}
        <div className="form-group">
          <label htmlFor="name">Nama:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Masukkan nama"
            className={error && !form.name.trim() ? 'error' : ''}
          />
        </div>

        {/* Input untuk nomor telepon */}
        <div className="form-group">
          <label htmlFor="phone">Telepon:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Masukkan nomor telepon"
            className={error && !form.phone.trim() ? 'error' : ''}
          />
        </div>

        {/* Menampilkan pesan error jika ada */}
        {error && <div className="error-message">{error}</div>}

        {/* Tombol aksi */}
        <div className="form-actions">
          <button type="submit" className="save-button">
            Simpan Perubahan
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={onCancel}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

// Export komponen EditContact sebagai default
export default EditContact;