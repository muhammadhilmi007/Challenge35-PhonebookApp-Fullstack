/**
 * EditContact Component
 * 
 * Handles the editing of existing contact information.
 * Features:
 * - Form validation
 * - Error handling
 * - Real-time form updates
 * - Cancel operation support
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.contact - Contact object to edit
 * @param {Function} props.onSave - Callback function after successful save
 * @param {Function} props.onCancel - Callback function to cancel editing
 */

import React, { useState } from "react";
// Services
import { api } from "../services/api";

const EditContact = ({ contact, onSave, onCancel }) => {
  // Form state
  const [form, setForm] = useState({
    name: contact.name,
    phone: contact.phone,
  });
  const [error, setError] = useState("");

  /**
   * Handles form input changes
   * 
   * @param {string} field - Field name to update
   * @param {string} value - New value for the field
   */
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  /**
   * Handles form submission and contact update
   * 
   * @param {Event} e - Form submission event
   */
  const saveContact = async (e) => {
    e.preventDefault();

    // Validate form inputs
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required");
      return;
    }

    try {
      const updated = await api.updateContact(contact.id, form);
      onSave(updated);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update contact");
      console.error("Error updating contact:", err);
    }
  };

  return (
    <div className="edit-contact">
      <h2>Edit Contact</h2>

      {/* Edit Form */}
      <form onSubmit={saveContact} className="edit-form">
        {/* Name Input */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter name"
            className={error && !form.name.trim() ? "error" : ""}
            aria-label="Contact name"
            aria-invalid={error && !form.name.trim()}
            required
          />
        </div>

        {/* Phone Input */}
        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className={error && !form.phone.trim() ? "error" : ""}
            aria-label="Contact phone"
            aria-invalid={error && !form.phone.trim()}
            required
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            aria-label="Save contact changes"
          >
            Save
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-button"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContact;
