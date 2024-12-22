import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';

// Create the http link
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
  headers: {
    'Apollo-Require-Preflight': 'true'
  }
});

// Create the Apollo Client instance
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  }
});

export default apolloClient;
