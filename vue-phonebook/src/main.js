import { createApp } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import { createApolloProvider } from '@vue/apollo-option'
import Modal from './components/Modal.vue'
import App from './App.vue'
import store from './store'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        contacts: {
          merge(existing, incoming) {
            return incoming;
          }
        }
      }
    }
  }
})

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )
  if (networkError) console.error(`[Network error]: ${networkError}`)
})

// HTTP connection link
const httpLink = new HttpLink({
  uri: 'http://localhost:3001/graphql',
})

const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    }
  }
})

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})

const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)
app.component('ModalView', Modal)
app.use(store)
app.use(apolloProvider)
app.mount('#app')