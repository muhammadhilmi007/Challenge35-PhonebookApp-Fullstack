/**
 * AddContact Component
 * 
 * Handles the creation of new contacts with offline support.
 * Features:
 * - Form validation
 * - Error handling
 * - Offline support with pending contacts
 * - Search parameter preservation
 * 
 * @component
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// Redux actions
import { addContact } from "../redux/contactThunks";
//import { loadContacts } from "../redux/contactThunks";

const AddContact = () => {
  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /**
   * Handles form submission and contact creation
   * Supports offline functionality by storing pending contacts
   * 
   * @param {Event} e - Event submit form
   */
  const saveContact = async (e) => {
    e.preventDefault();
    setSaving(true);

    const newContact = {
      name: form.name.trim(),
      phone: form.phone.trim(),
    };

    try {
      const result = await dispatch(addContact(newContact));
      if (result.success) {
        //dispatch(loadContacts(false));
        navigateBack();
      } else {
        setError("Failed to save contact");
      }
    } catch (error) {
      setError("An error occurred while saving the contact");
      console.error("Error saving contact:", error);
      // Add to pending contacts when offline
      const pendingContact = addPendingContact(newContact);
      if (pendingContact) {
        //dispatch(loadContacts(false));
        navigateBack();
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Navigates back to the contact list while preserving search parameters
   */
  const navigateBack = () => {
    const params = new URLSearchParams();
    const savedValues = {
      search: sessionStorage.getItem("contactSearch"),
      sortBy: sessionStorage.getItem("contactSortBy"),
      sortOrder: sessionStorage.getItem("contactSortOrder"),
    };

    // Preserve search parameter if search was active
    if (sessionStorage.getItem("searchActive") && savedValues.search) {
      params.append("search", savedValues.search);
    }

    // Add other parameters
    Object.entries(savedValues).forEach(([key, value]) => {
      if (value && key !== "search") {
        params.append(key, value);
      }
    });

    const query = params.toString();
    navigate(query ? `/?${query}` : "/", { replace: true });
  };

  /**
   * Handles form input changes
   * 
   * @param {string} field - Field name to update
   * @param {string} value - New value for the field
   */
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  /**
   * Adds a pending contact to sessionStorage
   * 
   * @param {Object} contact - Contact to add
   * @returns {Object} Added pending contact
   */
  const addPendingContact = (contact) => {
    const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
    const newContact = {
      ...contact,
      id: `pending_${Date.now()}`,
      status: 'pending',
      sent: false
    };
    pendingContacts.unshift(newContact);
    sessionStorage.setItem('pendingContacts', JSON.stringify(pendingContacts));
    return newContact;
  };

  return (
    <div className="add-view">
      <h2>Add Contact</h2>
      
      {/* Error Message */}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {/* Add Contact Form */}
      <form onSubmit={saveContact} className="add-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          className="add-input"
          aria-label="Contact name"
          disabled={saving}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
          className="add-input"
          aria-label="Contact phone number"
          disabled={saving}
        />

        {/* Form Actions */}
        <div className="add-form-actions">
          <button 
            type="submit" 
            className="save-button" 
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={navigateBack}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContact;
