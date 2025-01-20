/**
 * Main Application Component
 * 
 * Root component that sets up routing and context providers.
 * Features:
 * - React Router setup
 * - Redux provider
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
// Redux
import { Provider } from 'react-redux';
import store from './redux/store';
// Components
import MainPage from './components/MainPage';
import AddContact from './components/AddContact';
import AvatarUpload from './components/AvatarUpload';
// Styles
import './styles/styles.css';

const App = () => {
  return (
    <Provider store={store}>
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
    </Provider>
  );
};

export default App;
