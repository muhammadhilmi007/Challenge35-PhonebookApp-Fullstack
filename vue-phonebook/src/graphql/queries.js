import gql from 'graphql-tag'

export const GET_CONTACTS = gql`
  query GetContacts($page: Int!, $limit: Int!, $sortBy: String!, $sortOrder: String!, $search: String) {
    contacts(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {
      contacts {
        id
        name
        phone
      }
      page
      pages
      total
    }
  }
`