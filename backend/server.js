// backend/server.js
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const sequelize = require('./config/database');
const phonebookRoutes = require('./routes/phonebookRoutes');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Import GraphQL schema dan resolvers
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public')); // Serve files from public directory

// GraphQL upload middleware with configuration
app.use(graphqlUploadExpress({ 
  maxFileSize: 10000000, // 10 MB
  maxFiles: 1
}));

// REST API routes (bisa digunakan bersamaan dengan GraphQL)
app.use('/api', phonebookRoutes);

// Fungsi untuk menginisialisasi Apollo Server
async function startApolloServer() {
  // Buat instance Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    // Konfigurasi tambahan
    csrfPrevention: true,
    cache: 'bounded',
    playground: true, // Enable GraphQL Playground
    introspection: true, // Enable introspection
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware ke Express
  server.applyMiddleware({ 
    app,
    path: '/graphql', // Endpoint untuk GraphQL
    cors: false // We're already using cors middleware
  });

  const PORT = process.env.PORT || 3001;

  // Sync database dan start server
  try {
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🚀 REST API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

// Jalankan server
startApolloServer().catch(console.error);

module.exports = app;