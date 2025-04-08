import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { DatabaseProvider } from './context/DatabaseContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';

// Public pages
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import LandingPage from './pages/LandingPage.js';

// Protected pages
import Dashboard from './pages/Dashboard.js';
import ProfilePage from './pages/ProfilePage.js';

// Layout components
import MainLayout from './layouts/MainLayout.js';

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes with MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;