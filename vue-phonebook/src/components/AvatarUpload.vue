<template>
    <modal :show="show" @close="$emit('close')">
      <template #header>Update Profile Picture</template>
      
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragging }"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div v-if="preview" class="preview-container">
          <img :src="preview" alt="Preview" class="preview-image">
          <div class="preview-actions">
            <button @click="handleSelectFile">Change Image</button>
            <button @click="handleUpload" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </div>
        
        <div v-else class="upload-placeholder">
          <img 
            :src="currentAvatar || 'https://via.placeholder.com/150'" 
            alt="Current avatar"
            class="current-avatar"
          >
          <p>Drag & drop an image here or</p>
          <button @click="handleSelectFile">Select File</button>
          <button v-if="isMobile" @click="handleCapture">Take Photo</button>
        </div>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      >
      
      <template #footer>
        <button @click="$emit('close')">Cancel</button>
      </template>
    </modal>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  import { useMutation } from '@vue/apollo-composable'
  import { UPDATE_AVATAR } from '../graphql/mutations'
  import Modal from './Modal.vue'
  
  export default {
    name: 'AvatarUpload',
    components: { Modal },
    
    props: {
      show: Boolean,
      contactId: String,
      currentAvatar: String
    },
    
    emits: ['close', 'update'],
    
    setup(props, { emit }) {
      const fileInput = ref(null)
      const preview = ref(null)
      const isDragging = ref(false)
      const uploading = ref(false)
      
      const { mutate: updateAvatar } = useMutation(UPDATE_AVATAR)
      
      const isMobile = computed(() => {
        return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
      })
      
      const handleSelectFile = () => {
        fileInput.value.click()
      }
      
      const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (file) {
          createPreview(file)
        }
      }
      
      const handleDrop = (event) => {
        isDragging.value = false
        const file = event.dataTransfer.files[0]
        if (file) {
          createPreview(file)
        }
      }
      
      const createPreview = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          preview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
      
      const handleUpload = async () => {
        if (!preview.value) return
        
        try {
          uploading.value = true
          const response = await fetch(preview.value)
          const blob = await response.blob()
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
          
          const { data } = await updateAvatar({
            variables: {
              id: props.contactId,
              file
            }
          })
          
          emit('update', data.updateAvatar)
          emit('close')
        } catch (error) {
          console.error('Error uploading avatar:', error)
        } finally {
          uploading.value = false
        }
      }
      
      const handleCapture = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          // Implementation for camera capture would go here
          // This would typically involve creating a video element and canvas
          // to capture and process the image
          stream.getTracks().forEach(track => track.stop())
        } catch (error) {
          console.error('Error accessing camera:', error)
        }
      }
      
      return {
        fileInput,
        preview,
        isDragging,
        uploading,
        isMobile,
        handleSelectFile,
        handleFileSelect,
        handleDrop,
        handleUpload,
        handleCapture
      }
    }
  }
  </script>