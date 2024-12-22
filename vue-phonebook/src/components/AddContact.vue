<template>
  <div class="add-contact">
    <h2>Add New Contact</h2>
    
    <form @submit.prevent="handleSubmit" class="contact-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Enter name"
          :class="{ 'error': errors.name }"
        >
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="phone">Phone</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          required
          placeholder="Enter phone number"
          :class="{ 'error': errors.phone }"
        >
        <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email (Optional)</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter email"
          :class="{ 'error': errors.email }"
        >
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="cancel-button">
          Cancel
        </button>
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Adding...' : 'Add Contact' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'AddContact',
  
  emits: ['save', 'cancel'],
  
  setup(props, { emit }) {
    const form = reactive({
      name: '',
      phone: '',
      email: ''
    })
    
    const errors = reactive({
      name: '',
      phone: '',
      email: ''
    })
    
    const isSubmitting = ref(false)
    
    const validateForm = () => {
      let isValid = true
      
      // Reset errors
      errors.name = ''
      errors.phone = ''
      errors.email = ''
      
      // Validate name
      if (!form.name.trim()) {
        errors.name = 'Name is required'
        isValid = false
      }
      
      // Validate phone
      if (!form.phone.trim()) {
        errors.phone = 'Phone number is required'
        isValid = false
      } else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
        errors.phone = 'Please enter a valid phone number'
        isValid = false
      }
      
      // Validate email if provided
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address'
        isValid = false
      }
      
      return isValid
    }
    
    const handleSubmit = async () => {
      if (!validateForm()) return
      
      isSubmitting.value = true
      
      try {
        await emit('save', { ...form })
        // Reset form
        form.name = ''
        form.phone = ''
        form.email = ''
      } catch (error) {
        console.error('Error adding contact:', error)
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      form,
      errors,
      isSubmitting,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.add-contact {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 1.5rem;
  color: #333;
  text-align: center;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #666;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}
</style>