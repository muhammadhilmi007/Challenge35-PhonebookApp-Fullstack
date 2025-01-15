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

import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Services
import { api } from "../services/api";
// Context
import { useContactContext } from "../contexts/ContactContext";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const AvatarUpload = () => {
  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleRefreshContacts } = useContactContext();
  const fileInputRef = useRef(null);

  // State
  const [preview, setPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Fetch current contact avatar on component mount
   */
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contact = await api.getContactById(id);
        setAvatar(contact?.photo);
      } catch (err) {
        setError("Failed to fetch contact information");
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
      setError("Only images (JPEG, PNG, GIF) are allowed");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 5 MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handles file upload to server
   * 
   * @returns {Promise<void>}
   */
  const uploadAvatar = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      setError("");

      // Convert preview to file
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      // Prepare and send form data
      const formData = new FormData();
      formData.append("photo", file);

      await api.updateAvatar(id, formData);
      handleRefreshContacts();
      navigate("/");
    } catch (err) {
      setError("Failed to upload avatar");
      console.error("Error uploading avatar:", err);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Drag and drop event handlers
   */
  const dragEvents = {
    onDragOver: (e) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      setIsDragging(false);
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
          className={`upload-area ${isDragging ? "drag-over" : ""}`}
          {...dragEvents}
          role="region"
          aria-label="Avatar upload area"
        >
          {preview ? (
            // Preview Section
            <div className="preview-container">
              <img 
                src={preview} 
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
                src={avatar || "/user-avatar.svg"}
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
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={uploadAvatar}
            disabled={!preview || uploading}
            aria-busy={uploading}
          >
            {uploading ? "Uploading..." : "Upload Avatar"}
          </button>
          <button
            className="cancel-button"
            onClick={() => navigate("/")}
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
