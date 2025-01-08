import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function AddContact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const saveContact = async (e) => {
    e.preventDefault();

    /*
      Contoh, saat pengguna mengisi formulir 
      dan menekan tombol "Submit", jika tidak ada 
      validasi yang dijalankan, halaman akan dimuat 
      ulang dan data tidak akan diproses. 
      Dengan // e.preventDefault(), // kita dapat 
      menghentikan pemuatan ulang halaman, 
      melakukan validasi, dan hanya mengirim 
      data jika semua validasi terpenuhi.
      Kesimpulan
    */

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await api.addContact(form); // Memanggil addNewContact dengan data kontak baru
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    const params = new URLSearchParams();
    const savedValues = {
      search: sessionStorage.getItem("contactSearch"),
      sortBy: sessionStorage.getItem("contactSortBy"),
      sortOrder: sessionStorage.getItem("contactSortOrder"),
    };

    if (sessionStorage.getItem("searchActive") && savedValues.search) {
      params.append("search", savedValues.search);
    }

    Object.entries(savedValues).forEach(([key, value]) => {
      if (value && key !== "search") {
        params.append(key, value);
      }
    });

    const query = params.toString();
    navigate(query ? `/?${query}` : "/", { replace: true });
  };

  return (
    <div className="add-view">
      <h2>Add Contact</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={saveContact} className="add-form">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
          className="add-input"
        />

        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          required
          className="add-input"
        />

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
