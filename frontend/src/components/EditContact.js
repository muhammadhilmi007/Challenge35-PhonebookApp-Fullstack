import React, { useState } from 'react';
import { api } from '../services/api';

const EditContact = ({ contact, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Nama dan nomor telepon harus diisi');
      return;
    }

    try {
      const updatedContact = await api.updateContact(contact.id, form);
      onSave(updatedContact);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memperbarui kontak');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className="edit-contact">
      <h2>Edit Kontak</h2>
      <form onSubmit={handleSubmit} className="edit-form">
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

        {error && <div className="error-message">{error}</div>}

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

export default EditContact;