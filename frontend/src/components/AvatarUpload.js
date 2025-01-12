import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * Komponen AvatarUpload
 * 
 * Komponen untuk mengunggah dan memperbarui foto profil kontak.
 * Fitur:
 * - Drag and drop gambar
 * - Preview gambar sebelum upload
 * - Validasi ukuran dan tipe file
 * - Tampilan loading saat upload
 */
export default function AvatarUpload() {
  // ==================== Hooks & Refs ====================
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInput = useRef(null);

  // ==================== State Management ====================
  
  /**
   * States untuk mengelola avatar dan preview
   */
  const [preview, setPreview] = useState(null); // Preview gambar yang akan diunggah
  const [avatar, setAvatar] = useState(null); // Avatar saat ini
  
  /**
   * States untuk mengelola UI
   */
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // ==================== Effects ====================

  /**
   * Effect untuk mengambil data kontak saat komponen dimuat
   */
  useEffect(() => {
    const getContact = async () => {
      try {
        const contact = await api.getContactById(id);
        setAvatar(contact?.photo);
      } catch (err) {
        setError('Failed to load contact');
      }
    }
    getContact();
  }, [id]);

  // ==================== Event Handlers ====================

  /**
   * Memvalidasi dan menampilkan preview file yang dipilih
   * @param {File} file - File gambar yang akan divalidasi
   */
  const validateAndPreviewFile = (file) => {
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5MB');
      return;
    }

    // Membuat preview gambar
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Mengunggah avatar ke server
   */
  const uploadAvatar = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      setError('');

      // Konversi preview data URL ke File object
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      // Persiapkan FormData untuk upload
      const formData = new FormData();
      formData.append('photo', file);

      // Upload ke server
      await api.updateAvatar(id, formData);
      navigate('/');
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  // ==================== Render ====================

  return (
    <div className="avatar-upload-page">
      <div className="avatar-upload-container">
        {/* Header */}
        <div className="avatar-upload-header">
          <h3>Update Profile Photo</h3>
          <button className="close-button" onClick={() => navigate('/')}>&times;</button>
        </div>

        {/* Area Upload */}
        <div 
          className={`upload-area ${isDragging ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            validateAndPreviewFile(e.dataTransfer.files[0]);
          }}
        >
          {preview ? (
            // Tampilan preview
            <div className="preview-container">
              <img src={preview} alt="Preview" className="avatar-preview" />
              <button className="change-image" onClick={() => fileInput.current?.click()}>
                Change Image
              </button>
            </div>
          ) : (
            // Tampilan placeholder
            <div className="upload-placeholder">
              <img 
                src={avatar || '/user-avatar.svg'} 
                alt="Current avatar" 
                className="current-avatar"
              />
              <p>Drag & drop an image here or</p>
              <button onClick={() => fileInput.current?.click()}>Choose File</button>
            </div>
          )}
        </div>

        {/* Input file tersembunyi */}
        <input
          ref={fileInput}
          type="file"
          onChange={e => validateAndPreviewFile(e.target.files[0])}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Pesan error */}
        {error && <div className="error-message">{error}</div>}

        {/* Tombol aksi */}
        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={uploadAvatar}
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
}