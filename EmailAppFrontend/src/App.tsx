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

function App() {
  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, check for authentication token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handles user logout by clearing token and updating state
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        {/* Protected routes: Only accessible if authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/inbox"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Inbox />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/sent"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Sent />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compose"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Compose />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/drafts"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Drafts />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 