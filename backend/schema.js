const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Custom scalar for file uploads
  scalar Upload

  type Contact {
    id: ID!
    name: String!
    phone: String!
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type ContactsResponse {
    contacts: [Contact]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type Query {
    contacts(
      page: Int = 1
      limit: Int = 10
      search: String
      sortBy: String = "name"
      sortOrder: String = "asc"
    ): ContactsResponse!
    
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
      avatarUrl: String
    ): Contact!

    deleteContact(id: ID!): Boolean!

    uploadAvatar(id: ID!, file: Upload!): Contact!
  }
`;

module.exports = typeDefs;