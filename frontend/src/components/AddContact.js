// Mengimpor modul yang diperlukan dari React dan react-router-dom
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mendefinisikan komponen AddContact yang menerima prop onAdd
const AddContact = ({ onAdd }) => {
  // State untuk menyimpan data formulir
  const [form, setForm] = useState({ name: '', phone: '' });
  // State untuk menyimpan pesan error
  const [error, setError] = useState('');
  // State untuk menandai apakah formulir sedang disubmit
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Hook untuk navigasi
  const navigate = useNavigate();

  // Fungsi untuk menangani kembali ke halaman utama
  const handleCancel = () => {
    navigate('/', { replace: true });
  };

  // Fungsi untuk menangani submit formulir
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah perilaku default form submit
    setError(''); // Mengosongkan pesan error
    setIsSubmitting(true); // Menandai bahwa proses submit dimulai

    // Validasi input
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Mencoba menambahkan kontak baru
      await onAdd(form);
      navigate('/'); // Navigasi ke halaman utama jika berhasil
    } catch (error) {
      // Menangani error jika gagal menambahkan kontak
      setError(error.message || 'Error adding contact');
    } finally {
      // Mengatur isSubmitting kembali ke false setelah proses selesai
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Memperbarui state form dengan nilai input terbaru
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Render komponen
  return (
    <div className="add-view">
      <h2>Adding View</h2>
      {/* Menampilkan pesan error jika ada */}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-form">
        {/* Input untuk nama */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="add-input"
        />
        {/* Input untuk nomor telepon */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="add-input"
        />
        <div className="add-form-actions">
          {/* Tombol submit */}
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'save'}
          </button>
          {/* Tombol batal */}
          <button 
            type="button" 
            className="cancel-button" 
            onClick={handleCancel} 
            disabled={isSubmitting}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Mengekspor komponen AddContact
export default AddContact;