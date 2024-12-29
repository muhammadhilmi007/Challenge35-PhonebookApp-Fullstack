// Import library dan komponen yang diperlukan
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Komponen utama AvatarUpload
const AvatarUpload = ({ onAvatarUpdate }) => {
  // Mengambil parameter id dari URL
  const { id } = useParams();
  // Hook untuk navigasi
  const navigate = useNavigate();
  
  // State untuk menyimpan preview gambar
  const [preview, setPreview] = useState(null);
  // State untuk menyimpan avatar saat ini
  const [currentAvatar, setCurrentAvatar] = useState(null);
  // State untuk menandai proses upload
  const [uploading, setUploading] = useState(false);
  // State untuk menyimpan pesan error
  const [error, setError] = useState('');
  // Referensi untuk input file
  const fileInputRef = useRef(null);
  // State untuk menandai drag over
  const [dragOver, setDragOver] = useState(false);

  // Effect untuk mengambil data kontak saat komponen dimount
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contact = await api.getContactById(id);
        if (contact) {
          setCurrentAvatar(contact.photo);
        }
      } catch (err) {
        setError('Gagal mengambil informasi kontak');
        console.error('Error mengambil kontak:', err);
      }
    };
    fetchContact();
  }, [id]);

  // Fungsi untuk memilih file
  const handleFileSelect = useCallback((file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Pilih file gambar yang valid (JPG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file harus kurang dari 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }, []);

  // Fungsi untuk menangani drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  // Fungsi untuk menangani drag leave
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Fungsi untuk menangani drop file
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Fungsi untuk menangani input file
  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Fungsi untuk mengunggah avatar
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
      if (onAvatarUpdate) {
        await onAvatarUpdate();
      }
      navigate('/');
    } catch (err) {
      setError('Gagal mengunggah avatar. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  }, [preview, id, navigate, onAvatarUpdate]);

  // Fungsi untuk membuka dialog pemilihan file
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Fungsi untuk menangani pengambilan foto (khusus perangkat mobile)
  const handleCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Periksa izin.');
    }
  }, []);

  // Render komponen
  return (
    <div className="avatar-upload-page">
      <div className="avatar-upload-container">
        <div className="avatar-upload-header">
          <h3>Perbarui Foto Profil</h3>
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
                Ganti Gambar
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <img 
                src={currentAvatar || '/user-avatar.svg'} 
                alt="Avatar saat ini" 
                className="current-avatar"
              />
              <p>Seret & lepas gambar di sini atau</p>
              <button onClick={openFileDialog}>Pilih File</button>
              {/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                <button onClick={handleCapture}>Ambil Foto</button>
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
            {uploading ? 'Mengunggah...' : 'Unggah Avatar'}
          </button>
          <button
            className="cancel-button"
            onClick={() => navigate('/')}
            disabled={uploading}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

// Ekspor komponen
export default AvatarUpload;