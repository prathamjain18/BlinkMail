import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Sent from './pages/Sent';
import Compose from './pages/Compose';
import Layout from './components/Layout';
import Drafts from './pages/Drafts';
import api from './utils/axios';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Assume token is valid for initial render, validation can happen in background
      setIsAuthenticated(true);
      // Optional: Background validation
      api.get('/auth/validate-token').catch(() => {
        // Token is invalid, clear it
        localStorage.clear();
        setIsAuthenticated(false);
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // On mount, check for authentication token
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for storage changes to handle logout from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<Navigate to="/inbox" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/sent" element={<Sent />} />
            <Route path="/compose" element={<Compose />} />
            <Route path="/drafts" element={<Drafts />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/inbox' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App; 