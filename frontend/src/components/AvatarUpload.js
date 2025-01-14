/**
 * AvatarUpload Component
 * 
 * Handles contact avatar image upload and update functionality.
 * Features:
 * - Drag and drop support
 * - File validation (size and type)
 * - Image preview
 * - Mobile camera support
 * - Error handling
 * 
 * @component
 */

import React, { useReducer, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Services
import { api } from "../services/api";
// Context
import { useContactContext } from "../contexts/ContactContext";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PREVIEW':
      return { ...state, preview: action.payload };
    case 'SET_AVATAR':
      return { ...state, avatar: action.payload };
    case 'SET_UPLOADING':
      return { ...state, uploading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_IS_DRAGGING':
      return { ...state, isDragging: action.payload };
    default:
      return state;
  }
};

const AvatarUpload = () => {
  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleRefreshContacts } = useContactContext();
  const fileInputRef = useRef(null);

  // State
  const [state, dispatch] = useReducer(reducer, {
    preview: null,
    avatar: null,
    uploading: false,
    error: "",
    isDragging: false
  });

  /**
   * Fetch current contact avatar on component mount
   */
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contact = await api.getContactById(id);
        dispatch({ type: 'SET_AVATAR', payload: contact?.photo });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: "Failed to fetch contact information" });
        console.error("Error fetching contact:", err);
      }
    };

    fetchContact();
  }, [id]);

  /**
   * Validates and creates preview for selected file
   * 
   * @param {File} file - The file to validate and preview
   * @returns {void}
   */
  const validateAndPreviewFile = (file) => {
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      dispatch({ type: 'SET_ERROR', payload: "Only images (JPEG, PNG, GIF) are allowed" });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      dispatch({ type: 'SET_ERROR', payload: "Image size must not exceed 5 MB" });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'SET_PREVIEW', payload: reader.result });
      dispatch({ type: 'SET_ERROR', payload: "" });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handles file upload to server
   * 
   * @returns {Promise<void>}
   */
  const uploadAvatar = async () => {
    if (!state.preview) return;

    try {
      dispatch({ type: 'SET_UPLOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: "" });

      // Convert preview to file
      const response = await fetch(state.preview);
      const blob = await response.blob();
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      // Prepare and send form data
      const formData = new FormData();
      formData.append("photo", file);

      await api.updateAvatar(id, formData);
      handleRefreshContacts();
      navigate("/");
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: "Failed to upload avatar" });
      console.error("Error uploading avatar:", err);
    } finally {
      dispatch({ type: 'SET_UPLOADING', payload: false });
    }
  };

  /**
   * Drag and drop event handlers
   */
  const dragEvents = {
    onDragOver: (e) => {
      e.preventDefault();
      dispatch({ type: 'SET_IS_DRAGGING', payload: true });
    },
    onDragLeave: (e) => {
      e.preventDefault();
      dispatch({ type: 'SET_IS_DRAGGING', payload: false });
    },
    onDrop: (e) => {
      e.preventDefault();
      dispatch({ type: 'SET_IS_DRAGGING', payload: false });
      validateAndPreviewFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="avatar-upload-page">
      <div className="avatar-upload-container">
        {/* Header */}
        <div className="avatar-upload-header">
          <h3>Update Profile Photo</h3>
          <button 
            className="close-button" 
            onClick={() => navigate("/")}
            aria-label="Close upload dialog"
          >
            &times;
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`upload-area ${state.isDragging ? "drag-over" : ""}`}
          {...dragEvents}
          role="region"
          aria-label="Avatar upload area"
        >
          {state.preview ? (
            // Preview Section
            <div className="preview-container">
              <img 
                src={state.preview} 
                alt="Avatar preview" 
                className="avatar-preview"
              />
              <button 
                className="change-image"
                onClick={() => fileInputRef.current.click()}
              >
                Change Image
              </button>
            </div>
          ) : (
            // Upload Options
            <div className="upload-placeholder">
              <img
                src={state.avatar || "/user-avatar.svg"}
                alt="Current avatar"
                className="current-avatar"
              />
              <p>Drag & drop an image here or</p>
              <button onClick={() => fileInputRef.current.click()}>
                Select a File
              </button>
              {/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="mobile-camera-button"
                >
                  Take a Photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => validateAndPreviewFile(e.target.files[0])}
          accept="image/*"
          style={{ display: "none" }}
          aria-hidden="true"
        />

        {/* Error Display */}
        {state.error && (
          <div className="error-message" role="alert">
            {state.error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={uploadAvatar}
            disabled={!state.preview || state.uploading}
            aria-busy={state.uploading}
          >
            {state.uploading ? "Uploading..." : "Upload Avatar"}
          </button>
          <button
            className="cancel-button"
            onClick={() => navigate("/")}
            disabled={state.uploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
