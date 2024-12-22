import { createStore } from 'vuex'

export default createStore({
  state: {
    contacts: [],
    page: 1,
    limit: 20,
    hasMore: true,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    error: null
  },

  mutations: {
    SET_CONTACTS(state, contacts) {
      state.contacts = contacts
    },
    APPEND_CONTACTS(state, contacts) {
      state.contacts = [...state.contacts, ...contacts]
    },
    SET_PAGE(state, page) {
      state.page = page
    },
    SET_HAS_MORE(state, hasMore) {
      state.hasMore = hasMore
    },
    SET_SEARCH(state, search) {
      state.search = search
    },
    SET_SORT(state, { sortBy, sortOrder }) {
      state.sortBy = sortBy
      state.sortOrder = sortOrder
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    RESET_STATE(state) {
      state.contacts = []
      state.page = 1
      state.hasMore = true
      state.error = null
    }
  },

  actions: {
    async deleteContact({ commit, dispatch }, id) {
      try {
        // Implement delete mutation here
        commit('RESET_STATE')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateContact({ commit, dispatch }, contact) {
      try {
        // Implement update mutation here
        commit('RESET_STATE')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async addContact({ commit, dispatch }, contact) {
      try {
        // Implement add mutation here
        commit('RESET_STATE')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
})
