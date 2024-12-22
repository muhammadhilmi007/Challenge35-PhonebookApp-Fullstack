const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Custom scalar for file uploads
  scalar Upload

  type Contact {
    id: ID!
    name: String!
    phone: String!
    photo: String
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedContacts {
    contacts: [Contact!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type Query {
    contacts(
      page: Int
      limit: Int
      search: String
      sortBy: String
      sortOrder: String
    ): PaginatedContacts!
    
    contact(id: ID!): Contact
  }

  type Mutation {
    addContact(
      name: String!
      phone: String!
    ): Contact!

    updateContact(
      id: ID!
      name: String
      phone: String
      photo: String
    ): Contact!

    deleteContact(id: ID!): Boolean!

    uploadPhoto(id: ID!, file: Upload!): Contact!
  }
`;

module.exports = typeDefs;