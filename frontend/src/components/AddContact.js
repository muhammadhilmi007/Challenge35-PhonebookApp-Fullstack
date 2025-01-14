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

import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
// Services
import { api } from "../services/api";
import { localStorageUtil } from "../services/localStorage";
// Context
import { useContactContext } from "../contexts/ContactContext";

const initialState = {
  form: { name: "", phone: "" },
  error: "",
  saving: false
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'RESET_FORM':
      return { ...state, form: { name: "", phone: "" }, error: "" };
    default:
      return state;
  }
}

const AddContact = () => {
  // Hooks
  const navigate = useNavigate();
  const { handleRefreshContacts } = useContactContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Handles form submission and contact creation
   * Supports offline functionality by storing pending contacts
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
      dispatch({ type: 'SET_SAVING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: "" });
      
      try {
        // Attempt to save contact to server
        await api.addContact(state.form);
        handleRefreshContacts();
        navigateBack();
      } catch (err) {
        // Handle offline scenario
        const newContact = localStorageUtil.addPendingContact(state.form);
        const currentContacts = localStorageUtil.getAllContacts();
        
        if (!currentContacts.length) {
          localStorageUtil.saveAllContacts([newContact]);
        }
        
        handleRefreshContacts();
        navigateBack();
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.error || "Failed to add contact" });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
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
    dispatch({ type: 'SET_FORM', field, value });
    if (state.error) dispatch({ type: 'SET_ERROR', payload: "" });
  };

  return (
    <div className="add-view">
      <h2>Add Contact</h2>
      
      {/* Error Message */}
      {state.error && (
        <p className="error-message" role="alert">
          {state.error}
        </p>
      )}

      {/* Add Contact Form */}
      <form onSubmit={saveContact} className="add-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={state.form.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          className="add-input"
          aria-label="Contact name"
          disabled={state.saving}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={state.form.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
          className="add-input"
          aria-label="Contact phone number"
          disabled={state.saving}
        />

        {/* Form Actions */}
        <div className="add-form-actions">
          <button 
            type="submit" 
            className="save-button" 
            disabled={state.saving}
            aria-busy={state.saving}
          >
            {state.saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={navigateBack}
            disabled={state.saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContact;
