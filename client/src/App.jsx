import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// 🔒 ProtectedRoute Component
// This wrapper checks if the user is logged in.
// If yes -> Renders the child component (Dashboard).
// If no  -> Redirects them to the Login page.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show a simple loading message while the app checks for a saved token
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🔓 Public Routes - Accessible by anyone */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔒 Protected Routes - Accessible only if logged in */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* 🔀 Catch-all Route - Redirects unknown URLs to the home page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}