import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AvatarUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contact = await api.getContactById(id);
        if (contact) {
          setCurrentAvatar(contact.photo);
        }
      } catch (err) {
        setError('Failed to fetch contact information');
        console.error('Error fetching contact:', err);
      }
    };
    fetchContact();
  }, [id]);

  const handleFileSelect = useCallback((file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!preview) return;

    try {
      setUploading(true);
      setError('');

      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('photo', file);

      await api.updateAvatar(id, formData);
      navigate('/');
    } catch (err) {
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [preview, id, navigate]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  return (
    <div className="avatar-upload-page">
      <div className="avatar-upload-container">
        <div className="avatar-upload-header">
          <h3>Update Profile Picture</h3>
          <button className="close-button" onClick={() => navigate('/')}>&times;</button>
        </div>

        <div 
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="preview-container">
              <img 
                src={preview} 
                alt="Preview" 
                className="avatar-preview"
              />
              <button 
                className="change-image"
                onClick={openFileDialog}
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <img 
                src={currentAvatar || '/user-avatar.svg'} 
                alt="Current avatar" 
                className="current-avatar"
              />
              <p>Drag & drop an image here or</p>
              <button onClick={openFileDialog}>Select File</button>
              {/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                <button onClick={handleCapture}>Take Photo</button>
              )}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!preview || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Avatar'}
          </button>
          <button
            className="cancel-button"
            onClick={() => navigate('/')}
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