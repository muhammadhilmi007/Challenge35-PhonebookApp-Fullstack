<template>
  <div class="search-bar">
    <button @click="sort('name', sortOrder === 'asc' ? 'desc' : 'asc')" class="sort-button">
      <i class="fas fa-sort"></i>
    </button>

    <div class="search-box">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Search by name or phone number..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-button">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <button @click="$emit('add')" class="add-button">
      <i class="fas fa-user-plus"></i>
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'
import debounce from 'lodash/debounce'

export default {
  name: 'SearchBar',
  emits: ['search', 'sort', 'add'],

  setup(props, { emit }) {
    const searchQuery = ref('')
    const sortOrder = ref('asc')

    const handleSearch = debounce(() => {
      emit('search', {
        query: searchQuery.value,
        searchFields: ['name', 'phone'],
        sortBy: 'name',
        sortOrder: sortOrder.value,
      })
    }, 300)

    const sort = (sortBy, order) => {
      sortOrder.value = order
      emit('sort', {
        sortBy,
        order,
        query: searchQuery.value,
        searchFields: ['name', 'phone'],
      })
    }

    const clearSearch = () => {
      searchQuery.value = ''
      handleSearch()
    }

    return {
      searchQuery,
      sortOrder,
      handleSearch,
      sort,
      clearSearch,
    }
  },
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.sort-button,
.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background-color: #b8860b;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-button:hover,
.add-button:hover {
  background-color: #9b7300;
}

.sort-button i,
.add-button i {
  font-size: 1.1em;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #666;
}

.search-input {
  width: 100%;
  padding: 12px 40px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #b8860b;
  outline: none;
}

.clear-button {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .sort-button,
  .add-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
