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
// Services
import { api } from "../services/api";
// Redux actions
import { addPendingContact, clearContacts, loadContacts } from "../redux/contactSlice";

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
      const response = await api.addContact(newContact);
      if (response.id) {
        // Successfully added to server
        dispatch(clearContacts());
        dispatch(loadContacts({
          loadMore: false,
          sortBy: sessionStorage.getItem('contactSortBy') || 'name',
          sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc',
          search: sessionStorage.getItem('contactSearch') || ''
        }));
        navigateBack();
      }
    } catch (error) {
      console.log('Failed to add contact to server, saving to pending');
      // Add to pending contacts when offline
      dispatch(clearContacts());
      dispatch(addPendingContact(newContact));
      dispatch(loadContacts({
        loadMore: false,
        sortBy: sessionStorage.getItem('contactSortBy') || 'name',
        sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc',
        search: sessionStorage.getItem('contactSearch') || ''
      }));
      navigateBack();
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
