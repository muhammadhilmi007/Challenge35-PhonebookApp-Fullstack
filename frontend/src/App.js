/**
 * Main Application Component
 * 
 * Root component that sets up routing and context providers.
 * Features:
 * - React Router setup
 * - Contact context provider
 * - Main routes configuration
 * 
 * Routes:
 * - / : Main contact list page
 * - /add : Add new contact page
 * - /avatar/:id : Avatar upload page
 * 
 * @component
 */

import React from 'react';
// Routing
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Components
import MainPage from './components/MainPage';
import AddContact from './components/AddContact';
import AvatarUpload from './components/AvatarUpload';
// Context
import { ContactProvider } from './contexts/ContactContext';
// Styles
import './styles/styles.css';

const App = () => {
  return (
    <ContactProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Main Contact List */}
            <Route 
              path="/" 
              element={<MainPage />} 
            />
            
            {/* Add New Contact */}
            <Route 
              path="/add" 
              element={<AddContact />} 
            />
            
            {/* Avatar Upload */}
            <Route 
              path="/avatar/:id" 
              element={<AvatarUpload />} 
            />
          </Routes>
        </div>
      </Router>
    </ContactProvider>
  );
};

export default App;
