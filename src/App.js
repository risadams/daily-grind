import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext.js';
import { DatabaseProvider } from './context/DatabaseContext.js';

// Layouts
import MainLayout from './layouts/MainLayout.js';

// Pages
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import Profile from './pages/Profile.js';
import AllTickets from './pages/AllTickets.js';
import ForgotPassword from './pages/ForgotPassword.js';
import NotFound from './pages/NotFound.js';
import LogoutPage from './pages/LogoutPage.js';
import BacklogPage from './pages/Backlog.js';
import LandingPage from './pages/LandingPage.js';

// Guards
import PrivateRoute from './guards/PrivateRoute.js';
import PublicRoute from './guards/PublicRoute.js';

const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <DatabaseProvider>
          <Routes>
            {/* Root path */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<AllTickets />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/backlog" element={<BacklogPage />} />
              </Route>
            </Route>
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Routes>
        </DatabaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;