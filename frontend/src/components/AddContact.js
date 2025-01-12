import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

/**
 * Komponen AddContact
 * 
 * Komponen untuk menambahkan kontak baru ke dalam aplikasi.
 * Menyediakan form dengan input untuk nama dan nomor telepon.
 * Mendukung validasi input dan penanganan error.
 */
export default function AddContact() {
  const navigate = useNavigate();

  // ==================== State Management ====================
  
  /**
   * State untuk data form
   * @property {string} name - Nama kontak
   * @property {string} phone - Nomor telepon kontak
   */
  const [form, setForm] = useState({ name: "", phone: "" });
  
  /**
   * State untuk menangani error dan loading
   */
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ==================== Event Handlers ====================

  /**
   * Menyimpan kontak baru ke database
   * @param {Event} e - Event object dari form submission
   */
  const saveContact = async (e) => {
    e.preventDefault(); // Mencegah reload halaman saat form disubmit

    // Validasi input
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await api.addContact(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Kembali ke halaman utama dengan mempertahankan state pencarian
   */
  const goBack = () => {
    const params = new URLSearchParams();
    
    // Mengambil nilai yang tersimpan di session storage
    const savedValues = {
      search: sessionStorage.getItem("contactSearch"),
      sortBy: sessionStorage.getItem("contactSortBy"),
      sortOrder: sessionStorage.getItem("contactSortOrder"),
    };

    // Menambahkan parameter pencarian jika ada
    if (sessionStorage.getItem("searchActive") && savedValues.search) {
      params.append("search", savedValues.search);
    }

    // Menambahkan parameter pengurutan
    Object.entries(savedValues).forEach(([key, value]) => {
      if (value && key !== "search") {
        params.append(key, value);
      }
    });

    // Navigasi kembali dengan parameter yang sesuai
    const query = params.toString();
    navigate(query ? `/?${query}` : "/", { replace: true });
  };

  // ==================== Render ====================

  return (
    <div className="add-view">
      <h2>Add Contact</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={saveContact} className="add-form">
        {/* Input nama */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
          className="add-input"
        />

        {/* Input nomor telepon */}
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          required
          className="add-input"
        />

        {/* Tombol aksi */}
        <div className="add-form-actions">
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={goBack}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
