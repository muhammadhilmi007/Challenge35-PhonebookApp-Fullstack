import gql from 'graphql-tag'

export const ADD_CONTACT = gql`
  mutation AddContact($name: String!, $phone: String!) {
    addContact(name: $name, phone: $phone) {
      id
      name
      phone
      photo
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $name: String!, $phone: String!) {
    updateContact(id: $id, name: $name, phone: $phone) {
      id
      name
      phone
      photo
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id) {
      id
      name
      phone
      photo
    }
  }
`

export const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($id: ID!, $file: Upload!) {
    updateAvatar(id: $id, file: $file) {
      id
      photo
    }
  }
`