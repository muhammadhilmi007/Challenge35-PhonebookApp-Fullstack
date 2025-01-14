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

import React, { useReducer } from "react";
// Services
import { api } from "../services/api";

const initialState = {
  form: {
    name: '',
    phone: '',
  },
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, form: { ...state.form, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: '' };
    default:
      return state;
  }
}

const EditContact = ({ contact, onSave, onCancel }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    form: { name: contact.name, phone: contact.phone },
  });

  /**
   * Handles form input changes
   * 
   * @param {string} field - Field name to update
   * @param {string} value - New value for the field
   */
  const handleInputChange = (field, value) => {
    dispatch({ type: 'SET_FORM', payload: { [field]: value } });
    if (state.error) dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Handles form submission and contact update
   * 
   * @param {Event} e - Form submission event
   */
  const saveContact = async (e) => {
    e.preventDefault();

    // Validate form inputs
    if (!state.form.name.trim() || !state.form.phone.trim()) {
      dispatch({ type: 'SET_ERROR', payload: "Name and phone number are required" });
      return;
    }

    try {
      const updated = await api.updateContact(contact.id, state.form);
      onSave(updated);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.error || "Failed to update contact" });
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
            value={state.form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter name"
            className={state.error && !state.form.name.trim() ? "error" : ""}
            aria-label="Contact name"
            aria-invalid={state.error && !state.form.name.trim()}
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
            value={state.form.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className={state.error && !state.form.phone.trim() ? "error" : ""}
            aria-label="Contact phone"
            aria-invalid={state.error && !state.form.phone.trim()}
            required
          />
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="error-message" role="alert">
            {state.error}
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
