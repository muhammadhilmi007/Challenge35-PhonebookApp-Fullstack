<template>
  <div class="contact-list">
    <div v-if="loading && !contacts.length" class="loading">
      <div class="loading-spinner"></div>
      Loading contacts...
    </div>
    
    <div v-else-if="contacts.length === 0" class="no-contacts">
      <i class="fas fa-address-book"></i>
      <p>No contacts found</p>
    </div>
    
    <div v-else class="contacts-grid">
      <contact-card
        v-for="contact in contacts"
        :key="contact.id"
        :contact="contact"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <div v-if="loading && contacts.length" class="loading-more">
      <div class="loading-spinner"></div>
      Loading more...
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import ContactCard from './ContactCard.vue'

export default {
  name: 'ContactList',
  
  components: {
    ContactCard
  },
  
  props: {
    contacts: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: false
    }
  },

  emits: ['load-more', 'edit', 'delete'],

  setup(props, { emit }) {
    const handleScroll = () => {
      if (props.loading || !props.hasMore) return

      const { scrollTop, clientHeight, scrollHeight } = document.documentElement
      if (scrollHeight - scrollTop - clientHeight <= 200) {
        emit('load-more')
      }
    }

    // Debounce scroll handler
    const debounce = (fn, delay) => {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
      }
    }

    const debouncedScroll = debounce(handleScroll, 200)

    onMounted(() => {
      window.addEventListener('scroll', debouncedScroll)
      // Check initial state in case content is too short
      handleScroll()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', debouncedScroll)
    })
  }
}
</script>

<style scoped>
.contact-list {
  flex: 1;
  padding: 16px 0;
}

.contacts-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.loading,
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: #666;
}

.loading-more {
  padding: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #b8860b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-contacts {
  text-align: center;
  padding: 48px 0;
  color: #666;
}

.no-contacts i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

.no-contacts p {
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .contacts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
