<template>
  <div class="contact-card">
    <div class="contact-info">
      <div class="avatar-container">
        <img 
          :src="avatarUrl || defaultAvatar"
          :alt="contact.name"
          class="avatar"
        />
      </div>
      <div class="details">
        <div class="name">{{ contact.name }}</div>
        <div class="phone">{{ contact.phone }}</div>
      </div>
      <div class="actions">
        <button class="action-btn" @click="$emit('edit', contact)">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn" @click="$emit('delete', contact.id)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { config } from '../config'

export default {
  name: 'ContactCard',
  
  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  computed: {
    avatarUrl() {
      if (!this.contact.photo) {
        return this.defaultAvatar;
      }

      // If it's the default avatar from backend
      if (this.contact.photo === '/default-avatar.png') {
        return `${config.backendUrl}${this.contact.photo}`;
      }

      // If it's an uploaded photo
      if (this.contact.photo.startsWith('/uploads/')) {
        return `${config.backendUrl}${this.contact.photo}`;
      }

      // Fallback to default avatar
      return this.defaultAvatar;
    }
  },

  data() {
    return {
      defaultAvatar: `${config.backendUrl}/default-avatar.png`
    }
  }
}
</script>

<style scoped>
.contact-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f0f0;
  padding: 8px;
}

.details {
  flex-grow: 1;
}

.name {
  font-weight: 600;
  font-size: 1.1em;
  color: #2c3e50;
  margin-bottom: 4px;
}

.phone {
  color: #666;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #666;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #2c3e50;
}

.action-btn i {
  font-size: 1.1em;
}
</style>