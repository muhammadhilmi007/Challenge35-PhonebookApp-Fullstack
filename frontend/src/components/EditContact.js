import React, { useState } from "react";
import { api } from "../services/api";

export default function EditContact({ contact, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone,
  });
  const [error, setError] = useState("");

  const saveContact = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required");
      return;
    }

    try {
      const updated = await api.updateContact(contact.id, form);
      onSave(updated);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update contact");
    }
  };

  return (
    <div className="edit-contact">
      <h2>Edit Contact</h2>
      <form onSubmit={saveContact} className="edit-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter name"
            className={error && !form.name.trim() ? "error" : ""}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Enter phone number"
            className={error && !form.phone.trim() ? "error" : ""}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="save-button">
            Save
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
