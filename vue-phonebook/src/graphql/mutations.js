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
    deleteContact(id: $id)
  }
`

export const UPLOAD_PHOTO = gql`
  mutation UploadPhoto($id: ID!, $file: Upload!) {
    uploadPhoto(id: $id, file: $file) {
      id
      name
      phone
      photo
    }
  }
`