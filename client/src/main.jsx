/**
 * @file main.jsx
 * @description Application entry point for the React client.
 * Sets up React StrictMode, renders the root element, and wraps the app inside the AuthProvider.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Locate root DOM container and mount React virtual DOM tree
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
