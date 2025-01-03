// Mengimpor modul yang diperlukan dari React dan react-router-dom
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// !! Inisiasi Add Contact
// Mendefinisikan komponen AddContact yang menerima prop onAdd
const AddContact = ({ onAdd }) => {
  // 5.1 State untuk menyimpan data formulir
  const [form, setForm] = useState({ name: '', phone: '' });
  // 5.2 State untuk menyimpan pesan error
  const [error, setError] = useState('');
  // 5.3 State untuk menandai apakah formulir sedang disubmit
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Hook untuk navigasi
  const navigate = useNavigate();

  // !! Navigation Handling
  // Fungsi untuk menangani kembali ke halaman utama
  const handleCancel = () => {
    // 5.10 Preserve the existing search and sort state when navigating back
    const searchParams = new URLSearchParams();
    const search = sessionStorage.getItem('contactSearch');
    const sortBy = sessionStorage.getItem('contactSortBy');
    const sortOrder = sessionStorage.getItem('contactSortOrder');
    const isSearchActive = sessionStorage.getItem('searchActive');

    // 5.11 Build the query string with the existing search and sort state

    if (isSearchActive && search) {
      searchParams.append('search', search);
    }
    if (sortBy) {
      searchParams.append('sortBy', sortBy);
    }
    if (sortOrder) {
      searchParams.append('sortOrder', sortOrder);
    }

    // 5.12 Navigate with preserved search and sort state
    const queryString = searchParams.toString();
    navigate(`/${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  // !! Form Handling dan Validasi
  // 5.4 Fungsi untuk menangani submit formulir
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah perilaku default form submit
    setError(''); // Mengosongkan pesan error
    setIsSubmitting(true); // Menandai bahwa proses submit dimulai

    // 5.5 Validasi input
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required');
      setIsSubmitting(false);
      return;
    }

    // !! API Integration
    try {
      // 5.6 Mencoba menambahkan kontak baru
      await onAdd(form);
      navigate('/'); // Navigasi ke halaman utama jika berhasil
    } catch (error) {
      // 5.7 Menangani error jika gagal menambahkan kontak
      setError(error.message || 'Error adding contact');
    } finally {
      // 5.8 Mengatur isSubmitting kembali ke false setelah proses selesai
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

/*
Penjelasan, Alur, dan Logika:

1. Impor Modul:
   - Kode dimulai dengan mengimpor useState dari React dan useNavigate dari react-router-dom.

2. Definisi Komponen:
   - Komponen AddContact didefinisikan sebagai fungsi yang menerima prop onAdd.

3. State Management:
   - Menggunakan useState untuk mengelola state form, error, dan isSubmitting.
   - form menyimpan data input (nama dan nomor telepon).
   - error menyimpan pesan kesalahan jika ada.
   - isSubmitting menandai apakah form sedang dalam proses pengiriman.

4. Navigasi:
   - useNavigate digunakan untuk navigasi antar halaman.

5. Fungsi handleCancel:
   - Menangani pembatalan dan kembali ke halaman utama.
   - Mempertahankan state pencarian dan pengurutan saat pembatalan.

6. Fungsi handleSubmit:
   - Dipanggil saat form disubmit.
   - Mencegah perilaku default form.
   - Melakukan validasi input.
   - Jika valid, memanggil onAdd dengan data form.
   - Menangani error jika gagal menambahkan kontak.
   - Mengatur isSubmitting sesuai dengan status proses.

7. Fungsi handleChange:
   - Memperbarui state form saat input berubah.

8. Render Komponen:
   - Menampilkan form dengan input untuk nama dan nomor telepon.
   - Menampilkan pesan error jika ada.
   - Menyertakan tombol submit dan cancel.

9. Ekspor Komponen:
   - Mengekspor AddContact agar dapat digunakan di komponen lain.

Alur logika komponen ini adalah:
1. User mengisi form.
2. Saat input berubah, state form diperbarui.
3. Saat form disubmit, data divalidasi.
4. Jika valid, kontak baru ditambahkan.
5. Jika berhasil, user diarahkan ke halaman utama.
6. Jika gagal, pesan error ditampilkan.
7. User dapat membatalkan proses kapan saja.

Komponen ini menerapkan prinsip-prinsip React seperti penggunaan hooks (useState, useNavigate) dan pengelolaan state untuk membuat form yang interaktif dan responsif.
*/