import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function AvatarUpload({ onAvatarUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const getContact = async () => {
      try {
        const contact = await api.getContactById(id);
        setAvatar(contact?.photo);
      } catch (err) {
        setError("Gagal mengambil informasi kontak");
        console.error("Error mengambil kontak:", err);
      }
    };
    getContact();
  }, [id]);

  const validateAndPreviewFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Hanya gambar yang diizinkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar tidak boleh lebih dari 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      setError("");

      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("photo", file);

      await api.updateAvatar(id, formData);
      navigate("/");
    } catch (err) {
      setError("Gagal mengunggah avatar");
      console.error("Error mengunggah avatar:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload-page">
      <div className="avatar-upload-container">
        <div className="avatar-upload-header">
          <h3>Update Profile Photo</h3>
          <button className="close-button" onClick={() => navigate("/")}>
            &times;
          </button>
        </div>

        <div
          className={`upload-area ${isDragging ? "drag-over" : ""}`}
          onDragOver={e => {e.preventDefault(); setIsDragging(true)}}
          onDragLeave={e => {e.preventDefault(); setIsDragging(false)}}
          onDrop={e => {e.preventDefault(); setIsDragging(false); validateAndPreviewFile(e.dataTransfer.files[0])}}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="avatar-preview" />
              <button className="change-image" onClick={() => fileInputRef.current.click()}>
                Change Image
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <img
                src={avatar || "/user-avatar.svg"}
                alt="Avatar saat ini"
                className="current-avatar"
              />
              <p>Drag & drop an image here or</p>
              <button onClick={() => fileInputRef.current.click()}>Select a File</button>
              {/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                <button onClick={() => fileInputRef.current.click()}>Take a Photo</button>
              )}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={e => validateAndPreviewFile(e.target.files[0])}
          accept="image/*"
          style={{ display: "none" }}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={uploadAvatar}
            disabled={!preview || uploading}
          >
            {uploading ? "Mengunggah..." : "Unggah Avatar"}
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
}
