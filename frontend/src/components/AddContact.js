import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddContact = ({ onAdd }) => {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAdd(form);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Error adding contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="add-view">
      <h2>Adding View</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="add-input"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="add-input"
        />
        <div className="add-form-actions">
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'save'}
          </button>
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate('/')} 
            disabled={isSubmitting}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContact;