<template>
  <div class="app">
    <div class="container">   
      <search-bar
        @search="handleSearch"
        @sort="handleSort"
        @add="showAddModal = true"
      />

      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error.message }}
      </div>

      <contact-list
        :contacts="contacts"
        :loading="isLoading"
        :has-more="hasMore"
        @load-more="loadMore"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <modal-view
        v-if="showAddModal"
        :contact="editingContact"
        @close="closeModal"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { GET_CONTACTS } from './graphql/queries'
import { useStore } from 'vuex'
import SearchBar from './components/SearchBar.vue'
import ContactList from './components/ContactList.vue'
import ModalView from './components/Modal.vue'

export default {
  name: 'App',
  
  components: {
    SearchBar,
    ContactList,
    ModalView
  },

  setup() {
    const store = useStore()
    const showAddModal = ref(false)
    const editingContact = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const hasMore = computed(() => store.state.hasMore)
    const contacts = computed(() => store.state.contacts)

    const variables = computed(() => {
      const vars = {
        page: store.state.page,
        limit: store.state.limit,
        sortBy: store.state.sortBy,
        sortOrder: store.state.sortOrder,
      }
      if (store.state.search?.trim()) {
        vars.search = store.state.search
        vars.searchFields = ['name', 'phone'] // Add search fields to query
      }
      return vars
    })

    const { result, loading, error: queryError, refetch } = useQuery(
      GET_CONTACTS,
      variables,
      {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      }
    )

    watch(result, (newResult) => {
      if (newResult?.contacts) {
        const { contacts: newContacts, page, pages } = newResult.contacts
        
        // Append contacts for pagination, replace for new searches
        if (page === 1) {
          store.commit('SET_CONTACTS', newContacts)
        } else {
          store.commit('APPEND_CONTACTS', newContacts)
        }
        
        store.commit('SET_HAS_MORE', page < pages)
      }
    })

    watch(loading, (newLoading) => {
      isLoading.value = newLoading
    })

    watch(queryError, (newError) => {
      error.value = newError
      if (newError) {
        store.commit('SET_ERROR', newError.message)
      }
    })

    const handleSearch = async ({ query, searchFields, sortBy, sortOrder }) => {
      store.commit('RESET_STATE')
      store.commit('SET_SEARCH', query)
      store.commit('SET_SEARCH_FIELDS', searchFields)
      store.commit('SET_SORT', { 
        sortBy: sortBy || store.state.sortBy, 
        sortOrder: sortOrder || store.state.sortOrder 
      })
      try {
        await refetch()
      } catch (err) {
        error.value = err
      }
    }

    const handleSort = async ({ sortBy, order, query, searchFields }) => {
      store.commit('RESET_STATE')
      store.commit('SET_SORT', { sortBy, sortOrder: order })
      store.commit('SET_SEARCH', query)
      store.commit('SET_SEARCH_FIELDS', searchFields)
      try {
        await refetch()
      } catch (err) {
        error.value = err
      }
    }

    const loadMore = async () => {
      if (isLoading.value || !hasMore.value) return
      store.commit('SET_PAGE', store.state.page + 1)
      try {
        await refetch()
      } catch (err) {
        error.value = err
      }
    }

    const handleEdit = (contact) => {
      editingContact.value = { ...contact }
      showAddModal.value = true
    }

    const handleDelete = async (id) => {
      if (!confirm('Are you sure you want to delete this contact?')) return
      try {
        await store.dispatch('deleteContact', id)
        await refetch()
      } catch (err) {
        error.value = err
      }
    }

    const handleSave = async (contact) => {
      try {
        if (editingContact.value?.id) {
          await store.dispatch('updateContact', {
            id: editingContact.value.id,
            ...contact
          })
        } else {
          await store.dispatch('addContact', contact)
        }
        await refetch()
        closeModal()
      } catch (err) {
        error.value = err
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      editingContact.value = null
    }

    onMounted(async () => {
      try {
        await refetch()
      } catch (err) {
        error.value = err
      }
    })

    return {
      contacts,
      isLoading,
      error,
      hasMore,
      showAddModal,
      editingContact,
      handleSearch,
      handleSort,
      loadMore,
      handleEdit,
      handleDelete,
      handleSave,
      closeModal
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.app {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #dc3545;
  padding: 12px;
  margin: 16px 0;
  background-color: #fff;
  border: 1px solid #dc3545;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message i {
  font-size: 1.2em;
}

/* Reset styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input {
  font-family: inherit;
}
</style>
