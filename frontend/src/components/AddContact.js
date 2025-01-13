import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { localStorageUtil } from "../services/localStorage";

export default function AddContact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const saveContact = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      // Try to save to server first
      try {
        await api.addContact(form);
        navigate("/");
      } catch (err) {
        // If server is not available, save to localStorage
        const newContact = localStorageUtil.addPendingContact(form);
        // Save existing contacts to localStorage if not already saved
        const currentContacts = localStorageUtil.getAllContacts();
        if (!currentContacts.length) {
          localStorageUtil.saveAllContacts([newContact]);
        }
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add contact");
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
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="add-input"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
